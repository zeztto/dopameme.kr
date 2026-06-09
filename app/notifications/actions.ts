'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

async function getActiveUserId() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true },
  })

  if (!user || user.status !== 'active') {
    return null
  }

  return user.id
}

export async function markNotificationRead(input: { notificationId: string }) {
  const userId = await getActiveUserId()

  if (!userId) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  const notificationId = typeof input?.notificationId === 'string'
    ? input.notificationId.trim()
    : ''

  if (!notificationId || notificationId.length > 100) {
    return {
      success: false,
      error: '알림 정보가 올바르지 않습니다',
    }
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

  revalidatePath('/notifications')

  return {
    success: true,
  }
}

export async function markAllNotificationsRead() {
  const userId = await getActiveUserId()

  if (!userId) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

  revalidatePath('/notifications')

  return {
    success: true,
  }
}
