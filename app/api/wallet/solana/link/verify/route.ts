import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import {
  WalletVerificationError,
  isSolanaAddress,
  normalizeWalletProvider,
  verifySolanaWalletSignature,
} from '@/lib/solana/wallet-link'

export const dynamic = 'force-dynamic'

type ErrorCode =
  | 'auth.required'
  | 'auth.inactive'
  | 'request.invalid'
  | 'rate_limit.exceeded'
  | 'address.invalid'
  | 'wallet_link.nonce_not_found'
  | 'wallet_link.nonce_consumed'
  | 'wallet_link.nonce_expired'
  | 'wallet_link.address_mismatch'
  | 'wallet_link.message_mismatch'
  | 'wallet_link.address_already_linked'
  | 'signature.invalid'

class WalletLinkRequestError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'WalletLinkRequestError'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new WalletLinkRequestError(
        'auth.required',
        '로그인이 필요합니다.',
        401
      )
    }

    const ip = await getRequestIp()
    const rateLimit = checkRateLimit(`wallet-link-verify:${ip}:${session.user.id}`, {
      limit: 60,
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
    const nonce = typeof body?.nonce === 'string' ? body.nonce.trim() : ''
    const message = typeof body?.message === 'string' ? body.message : ''
    const signature =
      typeof body?.signature === 'string' ? body.signature.trim() : ''
    const walletProvider = normalizeWalletProvider(body?.wallet_provider)

    if (!isSolanaAddress(address)) {
      throw new WalletLinkRequestError(
        'address.invalid',
        '올바른 Solana 지갑 주소가 아닙니다.',
        400
      )
    }

    if (
      nonce.length < 16 ||
      nonce.length > 80 ||
      message.length < 40 ||
      message.length > 1200 ||
      signature.length === 0 ||
      signature.length > 120
    ) {
      throw new WalletLinkRequestError(
        'request.invalid',
        '지갑 연결 요청 값이 올바르지 않습니다.',
        400
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, status: true },
    })

    if (!user || user.status !== 'active') {
      throw new WalletLinkRequestError(
        'auth.inactive',
        '이용할 수 없는 계정입니다.',
        403
      )
    }

    const nonceRecord = await prisma.solanaWalletNonce.findUnique({
      where: { nonce },
      select: {
        id: true,
        userId: true,
        address: true,
        cluster: true,
        message: true,
        expiresAt: true,
        consumedAt: true,
      },
    })

    if (!nonceRecord || nonceRecord.userId !== user.id) {
      throw new WalletLinkRequestError(
        'wallet_link.nonce_not_found',
        '지갑 연결 요청을 찾을 수 없습니다.',
        404
      )
    }

    if (nonceRecord.consumedAt) {
      throw new WalletLinkRequestError(
        'wallet_link.nonce_consumed',
        '이미 사용한 지갑 연결 요청입니다.',
        409
      )
    }

    if (Date.now() > nonceRecord.expiresAt.getTime()) {
      throw new WalletLinkRequestError(
        'wallet_link.nonce_expired',
        '지갑 연결 요청이 만료되었습니다.',
        409
      )
    }

    if (nonceRecord.address !== address) {
      throw new WalletLinkRequestError(
        'wallet_link.address_mismatch',
        '서명한 지갑 주소가 요청과 다릅니다.',
        400
      )
    }

    if (nonceRecord.message !== message) {
      throw new WalletLinkRequestError(
        'wallet_link.message_mismatch',
        '서명 메시지가 요청과 다릅니다.',
        400
      )
    }

    verifySolanaWalletSignature({ address, message, signature })

    const verifiedAt = new Date()

    const linkedWallet = await prisma.$transaction(async (tx) => {
      const linkedToOtherUser = await tx.solanaWallet.findFirst({
        where: {
          address,
          userId: { not: user.id },
        },
        select: { id: true },
      })

      if (linkedToOtherUser) {
        throw new WalletLinkRequestError(
          'wallet_link.address_already_linked',
          '이미 다른 계정에 연결된 지갑입니다.',
          409
        )
      }

      const consumed = await tx.solanaWalletNonce.updateMany({
        where: {
          id: nonceRecord.id,
          consumedAt: null,
        },
        data: {
          consumedAt: verifiedAt,
        },
      })

      if (consumed.count !== 1) {
        throw new WalletLinkRequestError(
          'wallet_link.nonce_consumed',
          '이미 사용한 지갑 연결 요청입니다.',
          409
        )
      }

      return tx.solanaWallet.upsert({
        where: { userId: user.id },
        update: {
          address,
          cluster: nonceRecord.cluster,
          walletProvider,
          verifiedAt,
        },
        create: {
          userId: user.id,
          address,
          cluster: nonceRecord.cluster,
          walletProvider,
          verifiedAt,
        },
      })
    })

    return NextResponse.json({
      data: {
        address: linkedWallet.address,
        verified_at: linkedWallet.verifiedAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof WalletLinkRequestError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      )
    }

    if (error instanceof WalletVerificationError) {
      return NextResponse.json(
        {
          error: {
            code: 'signature.invalid',
            message: '지갑 서명을 검증하지 못했습니다.',
          },
        },
        { status: 400 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
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

    return NextResponse.json(
      {
        error: {
          code: 'request.invalid',
          message: '지갑 연결 요청을 처리하지 못했습니다.',
        },
      },
      { status: 500 }
    )
  }
}
