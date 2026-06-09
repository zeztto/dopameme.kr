'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { createNotification, deliverPushForNotification } from '@/lib/notifications'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

type FollowActionInput = {
  userId: string
}

async function getFollowActionContext(targetUserId: unknown) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      ok: false as const,
      error: '로그인이 필요합니다',
    }
  }

  if (typeof targetUserId !== 'string') {
    return {
      ok: false as const,
      error: '회원 정보가 올바르지 않습니다',
    }
  }

  const normalizedTargetUserId = targetUserId.trim()

  if (!normalizedTargetUserId || normalizedTargetUserId.length > 100) {
    return {
      ok: false as const,
      error: '회원 정보가 올바르지 않습니다',
    }
  }

  if (normalizedTargetUserId === session.user.id) {
    return {
      ok: false as const,
      error: '자기 자신은 팔로우할 수 없습니다',
    }
  }

  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`user-follow:${session.user.id}:${ip}:${normalizedTargetUserId}`, {
    limit: 20,
    windowMs: 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return {
      ok: false as const,
      error: `요청이 너무 빠릅니다. ${rateLimit.retryAfterSeconds}초 후 다시 시도해주세요.`,
    }
  }

  const [actor, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, status: true },
    }),
    prisma.user.findUnique({
      where: { id: normalizedTargetUserId },
      select: { id: true, status: true, role: true },
    }),
  ])

  if (!actor || actor.status !== 'active') {
    return {
      ok: false as const,
      error: '현재 계정 상태에서는 팔로우할 수 없습니다',
    }
  }

  if (!target || target.status !== 'active' || target.role === 'system') {
    return {
      ok: false as const,
      error: '팔로우할 수 없는 회원입니다',
    }
  }

  return {
    ok: true as const,
    followerId: actor.id,
    followerName: actor.name || '도파밈 유저',
    followingId: target.id,
  }
}

function revalidateFollowPaths(followerId: string, followingId: string) {
  revalidatePath(`/users/${followerId}`)
  revalidatePath(`/users/${followingId}`)
  revalidatePath('/leaderboard')
  revalidatePath('/app')
  revalidatePath('/feed')
  revalidatePath('/notifications')
}

export async function followUser(input: FollowActionInput) {
  try {
    const context = await getFollowActionContext(input?.userId)

    if (!context.ok) {
      return {
        success: false,
        error: context.error,
      }
    }

    const notification = await prisma.$transaction(async (tx) => {
      await tx.userFollow.create({
        data: {
          followerId: context.followerId,
          followingId: context.followingId,
        },
      })

      return createNotification(tx, {
        userId: context.followingId,
        actorId: context.followerId,
        type: 'new_follower',
        title: '새 팔로워',
        body: `${context.followerName}님이 팔로우했습니다.`,
        targetType: 'user',
        targetId: context.followerId,
        targetPath: `/users/${context.followerId}`,
      })
    })

    revalidateFollowPaths(context.followerId, context.followingId)
    await deliverPushForNotification(notification)

    return {
      success: true,
      following: true,
      message: '팔로우했습니다',
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: true,
        following: true,
        message: '이미 팔로우 중입니다',
      }
    }

    console.error('Follow user error:', error)
    return {
      success: false,
      error: '팔로우 처리 중 오류가 발생했습니다',
    }
  }
}

export async function unfollowUser(input: FollowActionInput) {
  try {
    const context = await getFollowActionContext(input?.userId)

    if (!context.ok) {
      return {
        success: false,
        error: context.error,
      }
    }

    await prisma.userFollow.deleteMany({
      where: {
        followerId: context.followerId,
        followingId: context.followingId,
      },
    })

    revalidateFollowPaths(context.followerId, context.followingId)

    return {
      success: true,
      following: false,
      message: '팔로우를 취소했습니다',
    }
  } catch (error) {
    console.error('Unfollow user error:', error)
    return {
      success: false,
      error: '언팔로우 처리 중 오류가 발생했습니다',
    }
  }
}
