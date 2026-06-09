import { NextRequest, NextResponse } from 'next/server'
import { authorizeB2bApiRequest } from '@/lib/b2b/api-auth'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const WINDOW_OPTIONS = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
} as const

type WindowOption = keyof typeof WINDOW_OPTIONS

type PublicMarket = {
  id: string
  title: string
  category: string
  status: string
  source: string
  createdAt: Date
  endsAt: Date
  options: Array<{
    id: string
    title: string
    totalAmount: number
    totalPredictions: number
  }>
  predictions: Array<{
    userId: string
    amount: number
    resolved: number
    createdAt: Date
  }>
  comments: Array<{
    createdAt: Date
  }>
}

function parseWindow(value: string | null) {
  if (!value) {
    return { ok: true as const, value: '7d' as WindowOption }
  }

  if (value in WINDOW_OPTIONS) {
    return { ok: true as const, value: value as WindowOption }
  }

  return {
    ok: false as const,
    error: 'window must be one of 7d, 14d, 30d',
  }
}

function parseBoolean(value: string | null) {
  if (!value) {
    return { ok: true as const, value: false }
  }

  if (value === 'true' || value === '1') {
    return { ok: true as const, value: true }
  }

  if (value === 'false' || value === '0') {
    return { ok: true as const, value: false }
  }

  return {
    ok: false as const,
    error: 'include_mock must be true, false, 1, or 0',
  }
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return ((current - previous) / previous) * 100
}

function getTopOption(market: PublicMarket) {
  const totalAmount = market.options.reduce((sum, option) => sum + option.totalAmount, 0)
  const topOption = [...market.options].sort((left, right) => (
    right.totalAmount - left.totalAmount || right.totalPredictions - left.totalPredictions
  ))[0]

  if (!topOption) return null

  return {
    title: topOption.title,
    total_amount: topOption.totalAmount,
    total_predictions: topOption.totalPredictions,
    share_bps: totalAmount > 0
      ? Math.round((topOption.totalAmount / totalAmount) * 10000)
      : 0,
  }
}

function marketVolume(market: PublicMarket) {
  return market.options.reduce((sum, option) => sum + option.totalAmount, 0)
}

function serializeMarket(market: PublicMarket) {
  const totalAmount = marketVolume(market)
  const totalPredictions = market.predictions.length
  const resolvedPredictions = market.predictions.filter((prediction) => prediction.resolved !== 0)
  const winningPredictions = resolvedPredictions.filter((prediction) => prediction.resolved === 1)

  return {
    id: market.id,
    title: market.title,
    category: market.category,
    status: market.status,
    source: market.source,
    created_at: market.createdAt.toISOString(),
    ends_at: market.endsAt.toISOString(),
    total_predictions: totalPredictions,
    unique_participants: new Set(market.predictions.map((prediction) => prediction.userId)).size,
    total_amount: totalAmount,
    comment_count: market.comments.length,
    option_count: market.options.length,
    top_option: getTopOption(market),
    resolved_prediction_count: resolvedPredictions.length,
    prediction_accuracy_bps: resolvedPredictions.length > 0
      ? Math.round((winningPredictions.length / resolvedPredictions.length) * 10000)
      : null,
  }
}

function buildCategoryRows(markets: PublicMarket[]) {
  const categoryMap = new Map<string, {
    category: string
    markets: number
    active_markets: number
    resolved_markets: number
    total_predictions: number
    uniqueParticipants: Set<string>
    total_amount: number
    comment_count: number
  }>()

  for (const market of markets) {
    const row = categoryMap.get(market.category) || {
      category: market.category,
      markets: 0,
      active_markets: 0,
      resolved_markets: 0,
      total_predictions: 0,
      uniqueParticipants: new Set<string>(),
      total_amount: 0,
      comment_count: 0,
    }

    row.markets += 1
    row.active_markets += market.status === 'active' ? 1 : 0
    row.resolved_markets += market.status === 'resolved' ? 1 : 0
    row.total_predictions += market.predictions.length
    row.total_amount += marketVolume(market)
    row.comment_count += market.comments.length

    for (const prediction of market.predictions) {
      row.uniqueParticipants.add(prediction.userId)
    }

    categoryMap.set(market.category, row)
  }

  return Array.from(categoryMap.values())
    .map((row) => ({
      category: row.category,
      markets: row.markets,
      active_markets: row.active_markets,
      resolved_markets: row.resolved_markets,
      total_predictions: row.total_predictions,
      unique_participants: row.uniqueParticipants.size,
      total_amount: row.total_amount,
      comment_count: row.comment_count,
    }))
    .sort((left, right) => right.total_amount - left.total_amount || right.total_predictions - left.total_predictions)
}

export async function GET(request: NextRequest) {
  const ip = await getRequestIp()
  const authRateLimit = checkRateLimit(`b2b-analytics-auth:${ip}`, {
    limit: 300,
    windowMs: 10 * 60 * 1000,
  })

  if (!authRateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'rate_limit.exceeded',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
      },
      {
        status: 429,
        headers: { 'Retry-After': String(authRateLimit.retryAfterSeconds) },
      }
    )
  }

  const authorized = await authorizeB2bApiRequest(request)

  if (!authorized.ok) {
    return NextResponse.json(
      {
        error: {
          code: authorized.code,
          message: authorized.message,
        },
      },
      { status: authorized.status }
    )
  }

  const rateLimit = checkRateLimit(`b2b-analytics:${authorized.mode}:${authorized.subject}:${ip}`, {
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

  const searchParams = request.nextUrl.searchParams
  const parsedWindow = parseWindow(searchParams.get('window'))
  const parsedIncludeMock = parseBoolean(searchParams.get('include_mock'))

  if (!parsedWindow.ok || !parsedIncludeMock.ok) {
    const message = !parsedWindow.ok
      ? parsedWindow.error
      : !parsedIncludeMock.ok
      ? parsedIncludeMock.error
      : 'Invalid query'

    return NextResponse.json(
      {
        error: {
          code: 'request.invalid_query',
          message,
        },
      },
      { status: 400 }
    )
  }

  const windowKey = parsedWindow.value
  const windowDays = WINDOW_OPTIONS[windowKey]
  const includeMock = parsedIncludeMock.value
  const since = daysAgo(windowDays)
  const previousSince = daysAgo(windowDays * 2)

  const markets = await prisma.market.findMany({
    where: {
      hidden: false,
      ...(includeMock ? {} : { source: { not: 'mock' } }),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      source: true,
      createdAt: true,
      endsAt: true,
      options: {
        select: {
          id: true,
          title: true,
          totalAmount: true,
          totalPredictions: true,
        },
      },
      predictions: {
        select: {
          userId: true,
          amount: true,
          resolved: true,
          createdAt: true,
        },
      },
      comments: {
        where: { status: 'visible' },
        select: { createdAt: true },
      },
    },
  })

  const allPredictions = markets.flatMap((market) => market.predictions)
  const recentPredictions = allPredictions.filter((prediction) => prediction.createdAt >= since)
  const previousPredictions = allPredictions.filter((prediction) => (
    prediction.createdAt >= previousSince && prediction.createdAt < since
  ))
  const recentVolume = recentPredictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const previousVolume = previousPredictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const visibleComments = markets.flatMap((market) => market.comments)
  const recentComments = visibleComments.filter((comment) => comment.createdAt >= since)
  const totalAmount = markets.reduce((sum, market) => sum + marketVolume(market), 0)
  const uniqueParticipants = new Set(allPredictions.map((prediction) => prediction.userId)).size
  const resolvedPredictions = allPredictions.filter((prediction) => prediction.resolved !== 0)
  const winningPredictions = resolvedPredictions.filter((prediction) => prediction.resolved === 1)

  const marketSummaries = markets
    .map(serializeMarket)
    .sort((left, right) => right.total_amount - left.total_amount || right.total_predictions - left.total_predictions)
    .slice(0, 50)

  return NextResponse.json(
    {
      data: {
        overview: {
          markets: markets.length,
          active_markets: markets.filter((market) => market.status === 'active').length,
          resolved_markets: markets.filter((market) => market.status === 'resolved').length,
          total_predictions: allPredictions.length,
          unique_participants: uniqueParticipants,
          total_amount: totalAmount,
          visible_comment_count: visibleComments.length,
          prediction_accuracy_bps: resolvedPredictions.length > 0
            ? Math.round((winningPredictions.length / resolvedPredictions.length) * 10000)
            : null,
        },
        trend: {
          window_days: windowDays,
          recent_predictions: recentPredictions.length,
          previous_predictions: previousPredictions.length,
          prediction_delta: recentPredictions.length - previousPredictions.length,
          prediction_change_pct: percentChange(recentPredictions.length, previousPredictions.length),
          recent_amount: recentVolume,
          previous_amount: previousVolume,
          amount_delta: recentVolume - previousVolume,
          amount_change_pct: percentChange(recentVolume, previousVolume),
          recent_comments: recentComments.length,
        },
        categories: buildCategoryRows(markets),
        markets: marketSummaries,
      },
      meta: {
        generated_at: new Date().toISOString(),
        window: windowKey,
        include_mock: includeMock,
        auth_mode: authorized.mode,
        privacy: {
          pii: false,
          user_identifiers: false,
          comment_bodies: false,
          wallet_addresses: false,
        },
      },
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    }
  )
}
