'use server'

import { auth } from '@/auth'
import { createDpmmLedgerEntry } from '@/lib/dpmm/ledger'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const managedRoles = ['user', 'admin'] as const
const managedStatuses = ['active', 'suspended'] as const
const maxBalanceDelta = 1_000_000

type ManagedRole = (typeof managedRoles)[number]
type ManagedStatus = (typeof managedStatuses)[number]

function isManagedRole(value: string): value is ManagedRole {
  return managedRoles.includes(value as ManagedRole)
}

function isManagedStatus(value: string): value is ManagedStatus {
  return managedStatuses.includes(value as ManagedStatus)
}

function normalizeUserId(userId: string) {
  const value = userId.trim()
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

async function ensureActiveAdminCapacity(
  tx: Prisma.TransactionClient,
  action: 'demote' | 'suspend'
) {
  const activeAdminCount = await tx.user.count({
    where: {
      role: 'admin',
      status: 'active',
    },
  })

  if (activeAdminCount <= 1) {
    throw new Error(action === 'demote' ? 'LAST_ADMIN_DEMOTE' : 'LAST_ADMIN_SUSPEND')
  }
}

export async function updateUserRole(input: {
  userId: string
  role: string
}) {
  try {
    const actorId = await getAdminActorId()
    const userId = normalizeUserId(input.userId)

    if (!userId || !isManagedRole(input.role)) {
      return {
        success: false,
        error: '요청 값이 올바르지 않습니다',
      }
    }

    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, status: true },
      })

      if (!target) {
        throw new Error('USER_NOT_FOUND')
      }

      if (target.role === 'system') {
        throw new Error('SYSTEM_USER_LOCKED')
      }

      if (target.id === actorId && input.role !== 'admin') {
        throw new Error('SELF_DEMOTE')
      }

      if (target.role === 'admin' && input.role !== 'admin' && target.status === 'active') {
        await ensureActiveAdminCapacity(tx, 'demote')
      }

      await tx.user.update({
        where: { id: userId },
        data: { role: input.role },
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePath('/admin')
    revalidatePath('/admin/users')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Update user role error:', error)

    if (error instanceof Error) {
      if (error.message === '관리자 권한이 필요합니다') {
        return { success: false, error: '관리자 권한이 필요합니다' }
      }
      if (error.message === 'LOGIN_REQUIRED') {
        return { success: false, error: '로그인이 필요합니다' }
      }
      if (error.message === 'USER_NOT_FOUND') {
        return { success: false, error: '회원을 찾을 수 없습니다' }
      }
      if (error.message === 'SYSTEM_USER_LOCKED') {
        return { success: false, error: '시스템 계정은 변경할 수 없습니다' }
      }
      if (error.message === 'SELF_DEMOTE') {
        return { success: false, error: '본인 관리자 권한은 직접 해제할 수 없습니다' }
      }
      if (error.message === 'LAST_ADMIN_DEMOTE') {
        return { success: false, error: '활성 관리자 계정이 최소 1개는 필요합니다' }
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return { success: false, error: '요청이 동시에 처리되어 실패했습니다. 다시 시도해주세요.' }
    }

    return {
      success: false,
      error: '회원 권한 변경 중 오류가 발생했습니다',
    }
  }
}

export async function updateUserStatus(input: {
  userId: string
  status: string
}) {
  try {
    const actorId = await getAdminActorId()
    const userId = normalizeUserId(input.userId)

    if (!userId || !isManagedStatus(input.status)) {
      return {
        success: false,
        error: '요청 값이 올바르지 않습니다',
      }
    }

    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, status: true },
      })

      if (!target) {
        throw new Error('USER_NOT_FOUND')
      }

      if (target.role === 'system') {
        throw new Error('SYSTEM_USER_LOCKED')
      }

      if (target.id === actorId && input.status !== 'active') {
        throw new Error('SELF_SUSPEND')
      }

      if (target.role === 'admin' && target.status === 'active' && input.status === 'suspended') {
        await ensureActiveAdminCapacity(tx, 'suspend')
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          status: input.status,
          ...(input.status === 'suspended' ? { sessionVersion: { increment: 1 } } : {}),
        },
      })

      if (input.status === 'suspended') {
        await tx.session.deleteMany({
          where: { userId },
        })
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePath('/admin')
    revalidatePath('/admin/users')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Update user status error:', error)

    if (error instanceof Error) {
      if (error.message === '관리자 권한이 필요합니다') {
        return { success: false, error: '관리자 권한이 필요합니다' }
      }
      if (error.message === 'LOGIN_REQUIRED') {
        return { success: false, error: '로그인이 필요합니다' }
      }
      if (error.message === 'USER_NOT_FOUND') {
        return { success: false, error: '회원을 찾을 수 없습니다' }
      }
      if (error.message === 'SYSTEM_USER_LOCKED') {
        return { success: false, error: '시스템 계정은 변경할 수 없습니다' }
      }
      if (error.message === 'SELF_SUSPEND') {
        return { success: false, error: '본인 계정은 직접 정지할 수 없습니다' }
      }
      if (error.message === 'LAST_ADMIN_SUSPEND') {
        return { success: false, error: '활성 관리자 계정이 최소 1개는 필요합니다' }
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return { success: false, error: '요청이 동시에 처리되어 실패했습니다. 다시 시도해주세요.' }
    }

    return {
      success: false,
      error: '회원 상태 변경 중 오류가 발생했습니다',
    }
  }
}

export async function adjustUserBalance(input: {
  userId: string
  delta: number
  reason: string
}) {
  try {
    const actorId = await getAdminActorId()
    const userId = normalizeUserId(input.userId)
    const delta = Number(input.delta)
    const reason = input.reason.trim()

    if (!userId || !Number.isInteger(delta) || delta === 0 || Math.abs(delta) > maxBalanceDelta) {
      return {
        success: false,
        error: 'DPMM 조정 값이 올바르지 않습니다',
      }
    }

    if (reason.length < 3 || reason.length > 160) {
      return {
        success: false,
        error: '조정 사유는 3자 이상 160자 이하로 입력해주세요',
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, dpmmBalance: true },
      })

      if (!target) {
        throw new Error('USER_NOT_FOUND')
      }

      if (target.role === 'system') {
        throw new Error('SYSTEM_USER_LOCKED')
      }

      const nextBalance = target.dpmmBalance + delta

      if (nextBalance < 0) {
        throw new Error('NEGATIVE_BALANCE')
      }

      const balanceUpdate = await tx.user.updateMany({
        where: {
          id: userId,
          ...(delta < 0 ? { dpmmBalance: { gte: Math.abs(delta) } } : {}),
        },
        data: {
          dpmmBalance: { increment: delta },
        },
      })

      if (balanceUpdate.count !== 1) {
        throw new Error('NEGATIVE_BALANCE')
      }

      const adjustment = await tx.userBalanceAdjustment.create({
        data: {
          userId,
          adminId: actorId,
          delta,
          reason,
        },
      })

      await createDpmmLedgerEntry(tx, {
        userId,
        actorId,
        type: 'admin_adjustment',
        delta,
        balanceAfter: nextBalance,
        reason,
        sourceType: 'user_balance_adjustment',
        sourceId: adjustment.id,
      })

      return {
        nextBalance,
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    revalidatePath('/app')

    return {
      success: true,
      balance: result.nextBalance,
    }
  } catch (error) {
    console.error('Adjust user balance error:', error)

    if (error instanceof Error) {
      if (error.message === '관리자 권한이 필요합니다') {
        return { success: false, error: '관리자 권한이 필요합니다' }
      }
      if (error.message === 'LOGIN_REQUIRED') {
        return { success: false, error: '로그인이 필요합니다' }
      }
      if (error.message === 'USER_NOT_FOUND') {
        return { success: false, error: '회원을 찾을 수 없습니다' }
      }
      if (error.message === 'SYSTEM_USER_LOCKED') {
        return { success: false, error: '시스템 계정은 변경할 수 없습니다' }
      }
      if (error.message === 'NEGATIVE_BALANCE') {
        return { success: false, error: '잔액은 0 미만으로 조정할 수 없습니다' }
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return { success: false, error: '요청이 동시에 처리되어 실패했습니다. 다시 시도해주세요.' }
    }

    return {
      success: false,
      error: 'DPMM 잔액 조정 중 오류가 발생했습니다',
    }
  }
}
