import { prisma } from '@/lib/db'
import { sendPushNotificationToUser } from '@/lib/push'
import type { Prisma } from '@prisma/client'

type NotificationClient = typeof prisma | Prisma.TransactionClient

type CreateNotificationInput = {
  userId: string
  actorId?: string | null
  type: string
  title: string
  body?: string | null
  targetType?: string | null
  targetId?: string | null
  targetPath?: string | null
}

type NotificationPushCandidate = {
  id: string
  userId: string
  type: string
  title: string
  body?: string | null
  targetPath?: string | null
} | null

export async function createNotification(
  client: NotificationClient,
  input: CreateNotificationInput,
) {
  if (input.actorId && input.actorId === input.userId) {
    return null
  }

  return client.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId || null,
      type: input.type,
      title: input.title,
      body: input.body || null,
      targetType: input.targetType || null,
      targetId: input.targetId || null,
      targetPath: input.targetPath || null,
    },
  })
}

export function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  })
}

export async function deliverPushForNotification(notification: NotificationPushCandidate) {
  if (!notification) {
    return
  }

  try {
    await sendPushNotificationToUser(notification.userId, {
      title: notification.title,
      body: notification.body,
      url: notification.targetPath || '/notifications',
      tag: `notification-${notification.id}`,
      notificationId: notification.id,
      type: notification.type,
    })
  } catch (error) {
    console.error('Push notification delivery failed:', error)
  }
}
