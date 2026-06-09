import webPush from 'web-push'
import { prisma } from '@/lib/db'

const DEFAULT_NOTIFICATION_PATH = '/notifications'
const MAX_PAYLOAD_TEXT_LENGTH = 180
const MAX_PUSH_SUBSCRIPTIONS_PER_SEND = 10

type WebPushConfig = {
  publicKey: string
  privateKey: string
  subject: string
}

export type PushNotificationPayload = {
  title: string
  body?: string | null
  url?: string | null
  tag?: string | null
  notificationId?: string | null
  type?: string | null
}

type PushSendResult = {
  attempted: number
  sent: number
  disabled: number
}

let configuredSignature = ''

function trimEnv(name: string) {
  return process.env[name]?.trim() || ''
}

function getWebPushConfig(): WebPushConfig | null {
  const publicKey = trimEnv('WEB_PUSH_VAPID_PUBLIC_KEY')
  const privateKey = trimEnv('WEB_PUSH_VAPID_PRIVATE_KEY')
  const subject = trimEnv('WEB_PUSH_CONTACT') || trimEnv('NEXTAUTH_URL') || 'https://dopameme.kr'

  if (!publicKey || !privateKey) {
    return null
  }

  return {
    publicKey,
    privateKey,
    subject,
  }
}

function configureWebPush() {
  const config = getWebPushConfig()

  if (!config) {
    return null
  }

  const signature = `${config.subject}:${config.publicKey}:${config.privateKey}`

  if (configuredSignature !== signature) {
    webPush.setVapidDetails(config.subject, config.publicKey, config.privateKey)
    configuredSignature = signature
  }

  return config
}

function normalizeTargetPath(path?: string | null) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return DEFAULT_NOTIFICATION_PATH
  }

  return path.slice(0, 512)
}

function truncatePayloadText(value?: string | null) {
  if (!value) return undefined
  return value.length > MAX_PAYLOAD_TEXT_LENGTH
    ? `${value.slice(0, MAX_PAYLOAD_TEXT_LENGTH - 1)}…`
    : value
}

function getPushErrorStatus(error: unknown) {
  return typeof error === 'object' && error !== null && 'statusCode' in error
    ? Number((error as { statusCode?: unknown }).statusCode)
    : 0
}

export function getWebPushPublicKey() {
  return getWebPushConfig()?.publicKey || null
}

export function isWebPushConfigured() {
  return Boolean(getWebPushConfig())
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload,
): Promise<PushSendResult> {
  const config = configureWebPush()

  if (!config) {
    return {
      attempted: 0,
      sent: 0,
      disabled: 0,
    }
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId,
      enabled: true,
    },
    take: MAX_PUSH_SUBSCRIPTIONS_PER_SEND,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  })

  const safePayload = JSON.stringify({
    title: truncatePayloadText(payload.title) || '도파밈 알림',
    body: truncatePayloadText(payload.body) || '새 알림이 도착했습니다.',
    url: normalizeTargetPath(payload.url),
    tag: payload.tag || (payload.notificationId ? `notification-${payload.notificationId}` : 'dopameme-notification'),
    notificationId: payload.notificationId || null,
    type: payload.type || null,
  })

  let sent = 0
  let disabled = 0

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          safePayload,
          {
            TTL: 60 * 60 * 24,
            urgency: 'normal',
          },
        )

        sent += 1
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: {
            lastUsedAt: new Date(),
            failedAt: null,
            failureCount: 0,
          },
        })
      } catch (error) {
        const statusCode = getPushErrorStatus(error)
        const expired = statusCode === 404 || statusCode === 410

        if (expired) {
          disabled += 1
        }

        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: {
            enabled: expired ? false : undefined,
            failedAt: new Date(),
            failureCount: {
              increment: 1,
            },
          },
        })
      }
    }),
  )

  return {
    attempted: subscriptions.length,
    sent,
    disabled,
  }
}
