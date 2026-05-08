import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { getSolanaTokenConfig } from '@/lib/solana/config'
import {
  WALLET_LINK_NONCE_TTL_SECONDS,
  buildWalletLinkMessage,
  createWalletLinkNonce,
  isSolanaAddress,
} from '@/lib/solana/wallet-link'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'auth.required', message: '로그인이 필요합니다.' } },
      { status: 401 }
    )
  }

  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`wallet-link-nonce:${ip}:${session.user.id}`, {
    limit: 30,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'rate_limit.exceeded',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      }
    )
  }

  const body = await request.json().catch(() => null)
  const address = typeof body?.address === 'string' ? body.address.trim() : ''

  if (!isSolanaAddress(address)) {
    return NextResponse.json(
      {
        error: {
          code: 'address.invalid',
          message: '올바른 Solana 지갑 주소가 아닙니다.',
        },
      },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true },
  })

  if (!user || user.status !== 'active') {
    return NextResponse.json(
      { error: { code: 'auth.inactive', message: '이용할 수 없는 계정입니다.' } },
      { status: 403 }
    )
  }

  const linkedToOtherUser = await prisma.solanaWallet.findFirst({
    where: {
      address,
      userId: { not: user.id },
    },
    select: { id: true },
  })

  if (linkedToOtherUser) {
    return NextResponse.json(
      {
        error: {
          code: 'wallet_link.address_already_linked',
          message: '이미 다른 계정에 연결된 지갑입니다.',
        },
      },
      { status: 409 }
    )
  }

  const config = getSolanaTokenConfig()
  const issuedAt = new Date()
  const expiresAt = new Date(
    issuedAt.getTime() + WALLET_LINK_NONCE_TTL_SECONDS * 1000
  )
  const nonce = createWalletLinkNonce()
  const message = buildWalletLinkMessage({
    domain: config.linkDomain,
    cluster: config.cluster,
    address,
    userId: user.id,
    nonce,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  })

  await prisma.solanaWalletNonce.create({
    data: {
      userId: user.id,
      address,
      cluster: config.cluster,
      nonce,
      message,
      expiresAt,
    },
  })

  return NextResponse.json({
    data: {
      nonce,
      expires_at: expiresAt.toISOString(),
      message,
    },
  })
}
