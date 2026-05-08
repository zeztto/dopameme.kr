import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { buildExplorerAddressUrl, getSolanaTokenConfig } from '@/lib/solana/config'
import { getDpmmTokenBalance, zeroTokenAmount } from '@/lib/solana/token-balance'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'auth.required', message: '로그인이 필요합니다.' } },
      { status: 401 }
    )
  }

  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`wallet-summary:${ip}:${session.user.id}`, {
    limit: 120,
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      status: true,
      dpmmBalance: true,
      solanaWallet: {
        select: {
          address: true,
          cluster: true,
          walletProvider: true,
          verifiedAt: true,
        },
      },
    },
  })

  if (!user || user.status !== 'active') {
    return NextResponse.json(
      { error: { code: 'auth.inactive', message: '이용할 수 없는 계정입니다.' } },
      { status: 403 }
    )
  }

  const config = getSolanaTokenConfig()
  let tokenBalance = null
  let balanceError: string | null = null

  if (user.solanaWallet?.address) {
    try {
      tokenBalance = await getDpmmTokenBalance(user.solanaWallet.address)
    } catch {
      balanceError = 'token_balance_unavailable'
    }
  }

  return NextResponse.json({
    data: {
      cluster: config.cluster,
      mint: config.mint,
      token_program: config.tokenProgram,
      token_name: config.tokenName,
      token_symbol: config.tokenSymbol,
      mint_explorer_url: buildExplorerAddressUrl(config.mint),
      game_balance: {
        amount: String(user.dpmmBalance),
        symbol: config.tokenSymbol,
      },
      linked_wallet: user.solanaWallet
        ? {
            address: user.solanaWallet.address,
            provider: user.solanaWallet.walletProvider ?? 'unknown',
            verified_at: user.solanaWallet.verifiedAt.toISOString(),
            explorer_url: buildExplorerAddressUrl(user.solanaWallet.address),
          }
        : null,
      token_balance: tokenBalance,
      balance_error: balanceError,
      claimable: zeroTokenAmount(config.decimals),
    },
    meta: {
      balance_error: balanceError,
    },
  })
}
