import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MAX_ENABLED_PUSH_SUBSCRIPTIONS_PER_USER = 10

type PushSubscriptionBody = {
  endpoint?: unknown
  keys?: {
    p256dh?: unknown
    auth?: unknown
  }
}

function jsonError(code: string, message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers },
  )
}

async function getActiveUserContext(action: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: jsonError('auth.required', '로그인이 필요합니다.', 401),
    }
  }

  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`push-subscription:${action}:${ip}:${session.user.id}`, {
    limit: 40,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return {
      ok: false as const,
      response: jsonError(
        'rate_limit.exceeded',
        '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        429,
        { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      ),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true },
  })

  if (!user || user.status !== 'active') {
    return {
      ok: false as const,
      response: jsonError('auth.inactive', '이용할 수 없는 계정입니다.', 403),
    }
  }

  return {
    ok: true as const,
    userId: user.id,
  }
}

function getValidatedSubscription(body: PushSubscriptionBody) {
  const endpoint = typeof body.endpoint === 'string' ? body.endpoint.trim() : ''
  const p256dh = typeof body.keys?.p256dh === 'string' ? body.keys.p256dh.trim() : ''
  const auth = typeof body.keys?.auth === 'string' ? body.keys.auth.trim() : ''

  if (
    !endpoint
    || !endpoint.startsWith('https://')
    || endpoint.length > 2048
    || !p256dh
    || p256dh.length > 512
    || !auth
    || auth.length > 512
  ) {
    return null
  }

  return {
    endpoint,
    p256dh,
    auth,
  }
}

export async function POST(request: NextRequest) {
  const context = await getActiveUserContext('create')

  if (!context.ok) {
    return context.response
  }

  let body: PushSubscriptionBody

  try {
    body = await request.json()
  } catch {
    return jsonError('request.invalid_json', '요청 본문이 올바른 JSON이 아닙니다.', 400)
  }

  const subscription = getValidatedSubscription(body)

  if (!subscription) {
    return jsonError('push_subscription.invalid', '푸시 구독 정보가 올바르지 않습니다.', 400)
  }

  const headerStore = await headers()
  const userAgent = headerStore.get('user-agent')?.slice(0, 500) || null

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId: context.userId,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      userAgent,
      enabled: true,
      failureCount: 0,
      failedAt: null,
    },
    create: {
      userId: context.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      userAgent,
    },
  })

  const extraSubscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: context.userId,
      enabled: true,
    },
    orderBy: { updatedAt: 'desc' },
    skip: MAX_ENABLED_PUSH_SUBSCRIPTIONS_PER_USER,
    select: { id: true },
  })

  if (extraSubscriptions.length > 0) {
    await prisma.pushSubscription.updateMany({
      where: {
        id: { in: extraSubscriptions.map((item) => item.id) },
      },
      data: {
        enabled: false,
      },
    })
  }

  return NextResponse.json({
    data: {
      subscribed: true,
    },
  })
}

export async function DELETE(request: NextRequest) {
  const context = await getActiveUserContext('delete')

  if (!context.ok) {
    return context.response
  }

  let body: { endpoint?: unknown }

  try {
    body = await request.json()
  } catch {
    return jsonError('request.invalid_json', '요청 본문이 올바른 JSON이 아닙니다.', 400)
  }

  const endpoint = typeof body.endpoint === 'string' ? body.endpoint.trim() : ''

  if (!endpoint || endpoint.length > 2048) {
    return jsonError('push_subscription.invalid', '푸시 구독 정보가 올바르지 않습니다.', 400)
  }

  await prisma.pushSubscription.updateMany({
    where: {
      userId: context.userId,
      endpoint,
    },
    data: {
      enabled: false,
    },
  })

  return NextResponse.json({
    data: {
      subscribed: false,
    },
  })
}
