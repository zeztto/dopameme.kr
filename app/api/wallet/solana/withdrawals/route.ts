import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { createDpmmLedgerEntry } from '@/lib/dpmm/ledger'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { getSolanaTokenConfig } from '@/lib/solana/config'
import {
  ACTIVE_WITHDRAWAL_STATUSES,
  MAX_WITHDRAWAL_AMOUNT,
  getMinWithdrawalAmount,
  normalizeWithdrawalAmount,
} from '@/lib/solana/withdrawals'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

function serializeWithdrawal(request: {
  id: string
  walletAddress: string
  amount: number
  status: string
  txSignature: string | null
  userNote: string | null
  requestedAt: Date
  reviewedAt: Date | null
  submittedAt: Date | null
  confirmedAt: Date | null
  failedAt: Date | null
}) {
  return {
    id: request.id,
    wallet_address: request.walletAddress,
    amount: request.amount,
    status: request.status,
    tx_signature: request.txSignature,
    user_note: request.userNote,
    requested_at: request.requestedAt.toISOString(),
    reviewed_at: request.reviewedAt?.toISOString() ?? null,
    submitted_at: request.submittedAt?.toISOString() ?? null,
    confirmed_at: request.confirmedAt?.toISOString() ?? null,
    failed_at: request.failedAt?.toISOString() ?? null,
  }
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'auth.required', message: '로그인이 필요합니다.' } },
      { status: 401 }
    )
  }

  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`withdrawal-history:${ip}:${session.user.id}`, {
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
      withdrawalRequests: {
        orderBy: { requestedAt: 'desc' },
        take: 20,
        select: {
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

  return NextResponse.json({
    data: user.withdrawalRequests.map(serializeWithdrawal),
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'auth.required', message: '로그인이 필요합니다.' } },
        { status: 401 }
      )
    }
    const userId = session.user.id

    const ip = await getRequestIp()
    const rateLimit = checkRateLimit(`withdrawal-create:${ip}:${userId}`, {
      limit: 10,
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
    const amount = normalizeWithdrawalAmount(body?.amount)
    const minAmount = getMinWithdrawalAmount()

    if (amount < minAmount || amount > MAX_WITHDRAWAL_AMOUNT) {
      return NextResponse.json(
        {
          error: {
            code: 'withdrawal.amount_invalid',
            message: `${minAmount.toLocaleString()}-${MAX_WITHDRAWAL_AMOUNT.toLocaleString()} DPMM 범위로 출금할 수 있습니다.`,
          },
        },
        { status: 400 }
      )
    }

    const config = getSolanaTokenConfig()

    const withdrawal = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          status: true,
          dpmmBalance: true,
          solanaWallet: {
            select: {
              address: true,
              cluster: true,
            },
          },
        },
      })

      if (!user || user.status !== 'active') {
        throw new Error('USER_INACTIVE')
      }

      if (!user.solanaWallet) {
        throw new Error('WALLET_REQUIRED')
      }

      const activeRequest = await tx.solanaWithdrawalRequest.findFirst({
        where: {
          userId: user.id,
          status: { in: [...ACTIVE_WITHDRAWAL_STATUSES] },
        },
        select: { id: true },
      })

      if (activeRequest) {
        throw new Error('ACTIVE_WITHDRAWAL_EXISTS')
      }

      const balanceUpdate = await tx.user.updateMany({
        where: {
          id: user.id,
          dpmmBalance: { gte: amount },
        },
        data: {
          dpmmBalance: { decrement: amount },
        },
      })

      if (balanceUpdate.count !== 1) {
        throw new Error('INSUFFICIENT_BALANCE')
      }

      const updatedUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { dpmmBalance: true },
      })

      if (!updatedUser) {
        throw new Error('USER_INACTIVE')
      }

      const withdrawal = await tx.solanaWithdrawalRequest.create({
        data: {
          userId: user.id,
          walletAddress: user.solanaWallet.address,
          cluster: user.solanaWallet.cluster || config.cluster,
          amount,
          status: 'pending',
        },
        select: {
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
        },
      })

      await createDpmmLedgerEntry(tx, {
        userId: user.id,
        type: 'withdrawal_request',
        delta: -amount,
        balanceAfter: updatedUser.dpmmBalance,
        reason: 'DPMM 출금 요청',
        sourceType: 'solana_withdrawal_request',
        sourceId: withdrawal.id,
      })

      return withdrawal
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePath('/app')
    revalidatePath('/app/wallet')
    revalidatePath('/admin')
    revalidatePath('/admin/withdrawals')

    return NextResponse.json({ data: serializeWithdrawal(withdrawal) }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'USER_INACTIVE') {
        return NextResponse.json(
          { error: { code: 'auth.inactive', message: '이용할 수 없는 계정입니다.' } },
          { status: 403 }
        )
      }
      if (error.message === 'WALLET_REQUIRED') {
        return NextResponse.json(
          {
            error: {
              code: 'withdrawal.wallet_required',
              message: '출금 받을 Solana 지갑을 먼저 연결해주세요.',
            },
          },
          { status: 409 }
        )
      }
      if (error.message === 'ACTIVE_WITHDRAWAL_EXISTS') {
        return NextResponse.json(
          {
            error: {
              code: 'withdrawal.active_exists',
              message: '처리 중인 출금 요청이 있습니다.',
            },
          },
          { status: 409 }
        )
      }
      if (error.message === 'INSUFFICIENT_BALANCE') {
        return NextResponse.json(
          {
            error: {
              code: 'withdrawal.insufficient_balance',
              message: '출금 가능한 DPMM 잔액이 부족합니다.',
            },
          },
          { status: 400 }
        )
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2034') {
        return NextResponse.json(
          {
            error: {
              code: 'withdrawal.concurrent_request',
              message: '요청이 동시에 처리되어 실패했습니다. 다시 시도해주세요.',
            },
          },
          { status: 409 }
        )
      }

      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: {
              code: 'withdrawal.active_exists',
              message: '처리 중인 출금 요청이 있습니다.',
            },
          },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      {
        error: {
          code: 'withdrawal.create_failed',
          message: '출금 요청을 생성하지 못했습니다.',
        },
      },
      { status: 500 }
    )
  }
}
