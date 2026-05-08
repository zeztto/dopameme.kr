'use server'

import { auth } from '@/auth'
import { requireAdmin } from '@/lib/auth-utils'
import { createDpmmLedgerEntry } from '@/lib/dpmm/ledger'
import { prisma } from '@/lib/db'
import {
  WithdrawalTransactionVerificationError,
  verifyDpmmWithdrawalTransaction,
} from '@/lib/solana/transaction'
import {
  isValidSolanaTransactionSignature,
  validateAdminNote,
} from '@/lib/solana/withdrawals'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

function normalizeRequestId(requestId: string) {
  const value = requestId.trim()
  return value.length > 0 && value.length <= 128 ? value : ''
}

async function getAdminActorId() {
  await requireAdmin()

  const session = await auth()
  const actorId = session?.user?.id

  if (!actorId) {
    throw new Error('LOGIN_REQUIRED')
  }

  return actorId
}

function revalidateWithdrawalPaths() {
  revalidatePath('/admin')
  revalidatePath('/admin/withdrawals')
  revalidatePath('/admin/users')
  revalidatePath('/app')
  revalidatePath('/app/wallet')
}

function actionError(error: unknown, fallback: string) {
  console.error('Withdrawal admin action error:', error)

  if (error instanceof Error) {
    if (error.message === '관리자 권한이 필요합니다') {
      return { success: false, error: '관리자 권한이 필요합니다' }
    }
    if (error.message === 'LOGIN_REQUIRED') {
      return { success: false, error: '로그인이 필요합니다' }
    }
    if (error.message === 'REQUEST_NOT_FOUND') {
      return { success: false, error: '출금 요청을 찾을 수 없습니다' }
    }
    if (error.message === 'INVALID_STATUS') {
      return { success: false, error: '현재 상태에서는 처리할 수 없습니다' }
    }
    if (error.message === 'INVALID_SIGNATURE') {
      return { success: false, error: 'Solana transaction signature가 올바르지 않습니다' }
    }
  }

  if (error instanceof WithdrawalTransactionVerificationError) {
    return { success: false, error: error.message }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2034') {
      return { success: false, error: '요청이 동시에 처리되어 실패했습니다. 다시 시도해주세요.' }
    }
    if (error.code === 'P2002') {
      return { success: false, error: '이미 기록된 transaction signature입니다' }
    }
  }

  return { success: false, error: fallback }
}

export async function approveWithdrawalRequest(input: {
  requestId: string
  note?: string
}) {
  try {
    const actorId = await getAdminActorId()
    const requestId = normalizeRequestId(input.requestId)
    const note = validateAdminNote(input.note)

    if (!requestId) {
      return { success: false, error: '요청 값이 올바르지 않습니다' }
    }

    const result = await prisma.solanaWithdrawalRequest.updateMany({
      where: {
        id: requestId,
        status: 'pending',
      },
      data: {
        status: 'approved',
        adminId: actorId,
        adminNote: note || null,
        reviewedAt: new Date(),
      },
    })

    if (result.count !== 1) {
      throw new Error('INVALID_STATUS')
    }

    revalidateWithdrawalPaths()
    return { success: true }
  } catch (error) {
    return actionError(error, '출금 요청 승인 중 오류가 발생했습니다')
  }
}

export async function rejectWithdrawalRequest(input: {
  requestId: string
  note: string
}) {
  try {
    const actorId = await getAdminActorId()
    const requestId = normalizeRequestId(input.requestId)
    const note = validateAdminNote(input.note)

    if (!requestId || note.length < 2) {
      return { success: false, error: '거절 사유를 입력해주세요' }
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.solanaWithdrawalRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          userId: true,
          amount: true,
          status: true,
        },
      })

      if (!request) {
        throw new Error('REQUEST_NOT_FOUND')
      }

      if (request.status !== 'pending' && request.status !== 'approved') {
        throw new Error('INVALID_STATUS')
      }

      const updated = await tx.solanaWithdrawalRequest.updateMany({
        where: {
          id: request.id,
          status: request.status,
        },
        data: {
          status: 'rejected',
          adminId: actorId,
          userNote: note,
          reviewedAt: new Date(),
        },
      })

      if (updated.count !== 1) {
        throw new Error('INVALID_STATUS')
      }

      const updatedUser = await tx.user.update({
        where: { id: request.userId },
        data: {
          dpmmBalance: { increment: request.amount },
        },
        select: { dpmmBalance: true },
      })

      await createDpmmLedgerEntry(tx, {
        userId: request.userId,
        actorId,
        type: 'withdrawal_refund',
        delta: request.amount,
        balanceAfter: updatedUser.dpmmBalance,
        reason: note,
        sourceType: 'solana_withdrawal_request',
        sourceId: request.id,
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidateWithdrawalPaths()
    return { success: true }
  } catch (error) {
    return actionError(error, '출금 요청 거절 중 오류가 발생했습니다')
  }
}

export async function submitWithdrawalTransaction(input: {
  requestId: string
  txSignature: string
}) {
  try {
    const actorId = await getAdminActorId()
    const requestId = normalizeRequestId(input.requestId)
    const txSignature = input.txSignature.trim()

    if (!requestId || !isValidSolanaTransactionSignature(txSignature)) {
      return { success: false, error: 'Solana transaction signature가 올바르지 않습니다' }
    }

    const request = await prisma.solanaWithdrawalRequest.findFirst({
      where: {
        id: requestId,
        status: 'approved',
      },
      select: {
        walletAddress: true,
        cluster: true,
        amount: true,
      },
    })

    if (!request) {
      throw new Error('INVALID_STATUS')
    }

    await verifyDpmmWithdrawalTransaction({
      signature: txSignature,
      walletAddress: request.walletAddress,
      cluster: request.cluster,
      amount: request.amount,
    })

    const result = await prisma.solanaWithdrawalRequest.updateMany({
      where: {
        id: requestId,
        status: 'approved',
      },
      data: {
        status: 'submitted',
        adminId: actorId,
        txSignature,
        submittedAt: new Date(),
      },
    })

    if (result.count !== 1) {
      throw new Error('INVALID_STATUS')
    }

    revalidateWithdrawalPaths()
    return { success: true }
  } catch (error) {
    return actionError(error, 'transaction signature 기록 중 오류가 발생했습니다')
  }
}

export async function confirmWithdrawalRequest(input: {
  requestId: string
}) {
  try {
    const actorId = await getAdminActorId()
    const requestId = normalizeRequestId(input.requestId)

    if (!requestId) {
      return { success: false, error: '요청 값이 올바르지 않습니다' }
    }

    const request = await prisma.solanaWithdrawalRequest.findFirst({
      where: {
        id: requestId,
        status: 'submitted',
        txSignature: { not: null },
      },
      select: {
        txSignature: true,
        walletAddress: true,
        cluster: true,
        amount: true,
      },
    })

    if (!request?.txSignature) {
      throw new Error('INVALID_STATUS')
    }

    await verifyDpmmWithdrawalTransaction({
      signature: request.txSignature,
      walletAddress: request.walletAddress,
      cluster: request.cluster,
      amount: request.amount,
    })

    const result = await prisma.solanaWithdrawalRequest.updateMany({
      where: {
        id: requestId,
        status: 'submitted',
        txSignature: { not: null },
      },
      data: {
        status: 'confirmed',
        adminId: actorId,
        confirmedAt: new Date(),
      },
    })

    if (result.count !== 1) {
      throw new Error('INVALID_STATUS')
    }

    revalidateWithdrawalPaths()
    return { success: true }
  } catch (error) {
    return actionError(error, '출금 요청 확정 중 오류가 발생했습니다')
  }
}

export async function failWithdrawalRequest(input: {
  requestId: string
  note: string
}) {
  try {
    const actorId = await getAdminActorId()
    const requestId = normalizeRequestId(input.requestId)
    const note = validateAdminNote(input.note)

    if (!requestId || note.length < 2) {
      return { success: false, error: '실패 사유를 입력해주세요' }
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.solanaWithdrawalRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          userId: true,
          amount: true,
          status: true,
        },
      })

      if (!request) {
        throw new Error('REQUEST_NOT_FOUND')
      }

      if (request.status !== 'submitted') {
        throw new Error('INVALID_STATUS')
      }

      const updated = await tx.solanaWithdrawalRequest.updateMany({
        where: {
          id: request.id,
          status: 'submitted',
        },
        data: {
          status: 'failed',
          adminId: actorId,
          userNote: note,
          failedAt: new Date(),
        },
      })

      if (updated.count !== 1) {
        throw new Error('INVALID_STATUS')
      }

      const updatedUser = await tx.user.update({
        where: { id: request.userId },
        data: {
          dpmmBalance: { increment: request.amount },
        },
        select: { dpmmBalance: true },
      })

      await createDpmmLedgerEntry(tx, {
        userId: request.userId,
        actorId,
        type: 'withdrawal_refund',
        delta: request.amount,
        balanceAfter: updatedUser.dpmmBalance,
        reason: note,
        sourceType: 'solana_withdrawal_request',
        sourceId: request.id,
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidateWithdrawalPaths()
    return { success: true }
  } catch (error) {
    return actionError(error, '출금 실패 처리 중 오류가 발생했습니다')
  }
}
