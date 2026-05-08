import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { buildExplorerAddressUrl, getSolanaTokenConfig } from '@/lib/solana/config'
import { getDpmmTokenBalance, zeroTokenAmount } from '@/lib/solana/token-balance'
import {
  ACTIVE_WITHDRAWAL_STATUSES,
  MAX_WITHDRAWAL_AMOUNT,
  getMinWithdrawalAmount,
} from '@/lib/solana/withdrawals'

export const dynamic = 'force-dynamic'

const withdrawalSelect = {
  id: true,
  walletAddress: true,
  amount: true,
  status: true,
  txSignature: true,
  userNote: true,
  requestedAt: true,
  reviewedAt: true,
  submittedAt: true,
  confirmedAt: true,
  failedAt: true,
} as const

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
      withdrawalRequests: {
        take: 5,
        orderBy: { requestedAt: 'desc' },
        select: withdrawalSelect,
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
  const minWithdrawalAmount = getMinWithdrawalAmount()
  let tokenBalance = null
  let balanceError: string | null = null
  const activeWithdrawal = await prisma.solanaWithdrawalRequest.findFirst({
    where: {
      userId: session.user.id,
      status: { in: [...ACTIVE_WITHDRAWAL_STATUSES] },
    },
    orderBy: { requestedAt: 'desc' },
    select: withdrawalSelect,
  })

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
      withdrawal_policy: {
        min_amount: minWithdrawalAmount,
        max_amount: Math.min(user.dpmmBalance, MAX_WITHDRAWAL_AMOUNT),
        active_request_required_clear: Boolean(activeWithdrawal),
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
      active_withdrawal: activeWithdrawal
        ? {
            id: activeWithdrawal.id,
            wallet_address: activeWithdrawal.walletAddress,
            amount: activeWithdrawal.amount,
            status: activeWithdrawal.status,
            tx_signature: activeWithdrawal.txSignature,
            requested_at: activeWithdrawal.requestedAt.toISOString(),
            reviewed_at: activeWithdrawal.reviewedAt?.toISOString() ?? null,
            submitted_at: activeWithdrawal.submittedAt?.toISOString() ?? null,
            confirmed_at: activeWithdrawal.confirmedAt?.toISOString() ?? null,
            failed_at: activeWithdrawal.failedAt?.toISOString() ?? null,
            user_note: activeWithdrawal.userNote,
          }
        : null,
      withdrawals: user.withdrawalRequests.map((request) => ({
        id: request.id,
        wallet_address: request.walletAddress,
        amount: request.amount,
        status: request.status,
        tx_signature: request.txSignature,
        requested_at: request.requestedAt.toISOString(),
        reviewed_at: request.reviewedAt?.toISOString() ?? null,
        submitted_at: request.submittedAt?.toISOString() ?? null,
        confirmed_at: request.confirmedAt?.toISOString() ?? null,
        failed_at: request.failedAt?.toISOString() ?? null,
        user_note: request.userNote,
      })),
    },
    meta: {
      balance_error: balanceError,
    },
  })
}
