import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

type MarketSummary = {
  id: string
  title: string
  category: string
  status: string
  source: string
  hidden: boolean
  createdAt: Date
  endsAt: Date
}

type MarketTrend = MarketSummary & {
  recentPredictions: number
  previousPredictions: number
  recentVolume: number
  previousVolume: number
  recentComments: number
  previousComments: number
  score: number
}

type CategoryTrend = {
  category: string
  recentPredictions: number
  previousPredictions: number
  recentVolume: number
  previousVolume: number
  recentComments: number
  previousComments: number
  newMarkets: number
  activeMarkets: number
  score: number
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatRate(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return `${value.toFixed(1).replace(/\.0$/, '')}%`
}

function formatDelta(value: number) {
  return `${value > 0 ? '+' : ''}${value.toLocaleString()}`
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return ((current - previous) / previous) * 100
}

function toneClass(tone: Tone) {
  return {
    primary: 'border-primary/25 bg-primary/5 text-primary',
    secondary: 'border-secondary/25 bg-secondary/5 text-secondary',
    success: 'border-success/25 bg-success/5 text-success',
    warning: 'border-warning/25 bg-warning/5 text-warning',
    neutral: 'border-light-border bg-white text-text-primary',
  }[tone]
}

function barClass(tone: Tone) {
  return {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    neutral: 'bg-text-tertiary',
  }[tone]
}

function StatCard({
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  label: string
  value: string
  helper: string
  tone?: Tone
}) {
  return (
    <div className={`rounded-dopameme-lg border-3 p-5 shadow-token-sm ${toneClass(tone)}`}>
      <div className="text-sm font-black text-text-tertiary">{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

function ProgressRow({
  label,
  value,
  helper,
  percentage,
  tone = 'primary',
}: {
  label: string
  value: string
  helper: string
  percentage: number
  tone?: Tone
}) {
  return (
    <div className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-text-primary">{label}</div>
          <div className="mt-1 text-xs font-bold text-text-tertiary">{helper}</div>
        </div>
        <div className="shrink-0 text-sm font-black text-primary">{value}</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-dopameme-pill bg-light-bg-alt">
        <div
          className={`h-full rounded-dopameme-pill ${barClass(tone)}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  )
}

function getOrCreateMarketTrend(map: Map<string, MarketTrend>, market: MarketSummary) {
  const existing = map.get(market.id)

  if (existing) return existing

  const row: MarketTrend = {
    ...market,
    recentPredictions: 0,
    previousPredictions: 0,
    recentVolume: 0,
    previousVolume: 0,
    recentComments: 0,
    previousComments: 0,
    score: 0,
  }

  map.set(market.id, row)
  return row
}

function getOrCreateCategoryTrend(map: Map<string, CategoryTrend>, category: string) {
  const existing = map.get(category)

  if (existing) return existing

  const row: CategoryTrend = {
    category,
    recentPredictions: 0,
    previousPredictions: 0,
    recentVolume: 0,
    previousVolume: 0,
    recentComments: 0,
    previousComments: 0,
    newMarkets: 0,
    activeMarkets: 0,
    score: 0,
  }

  map.set(category, row)
  return row
}

export default async function AdminTrendStatsPage() {
  const now = new Date()
  const recentStart = daysAgo(7)
  const previousStart = daysAgo(14)

  const [
    recentPredictionRows,
    recentCommentRows,
    marketRows,
  ] = await Promise.all([
    prisma.prediction.findMany({
      where: {
        createdAt: { gte: previousStart },
      },
      select: {
        amount: true,
        createdAt: true,
        market: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            source: true,
            hidden: true,
            createdAt: true,
            endsAt: true,
          },
        },
      },
    }),
    prisma.marketComment.findMany({
      where: {
        createdAt: { gte: previousStart },
        status: 'visible',
      },
      select: {
        createdAt: true,
        market: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            source: true,
            hidden: true,
            createdAt: true,
            endsAt: true,
          },
        },
      },
    }),
    prisma.market.findMany({
      where: {
        OR: [
          { createdAt: { gte: previousStart } },
          { status: 'active' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        source: true,
        hidden: true,
        createdAt: true,
        endsAt: true,
        options: {
          select: {
            totalAmount: true,
            totalPredictions: true,
          },
        },
        _count: {
          select: {
            predictions: true,
            comments: true,
          },
        },
      },
    }),
  ])

  const marketTrendMap = new Map<string, MarketTrend>()
  const categoryTrendMap = new Map<string, CategoryTrend>()

  for (const market of marketRows) {
    const marketTrend = getOrCreateMarketTrend(marketTrendMap, market)
    const categoryTrend = getOrCreateCategoryTrend(categoryTrendMap, market.category)

    if (market.status === 'active' && !market.hidden) {
      categoryTrend.activeMarkets += 1
    }

    if (market.createdAt >= recentStart) {
      categoryTrend.newMarkets += 1
      marketTrend.score += 8
    }
  }

  for (const prediction of recentPredictionRows) {
    const market = prediction.market
    const marketTrend = getOrCreateMarketTrend(marketTrendMap, market)
    const categoryTrend = getOrCreateCategoryTrend(categoryTrendMap, market.category)
    const isRecent = prediction.createdAt >= recentStart

    if (isRecent) {
      marketTrend.recentPredictions += 1
      marketTrend.recentVolume += prediction.amount
      categoryTrend.recentPredictions += 1
      categoryTrend.recentVolume += prediction.amount
    } else {
      marketTrend.previousPredictions += 1
      marketTrend.previousVolume += prediction.amount
      categoryTrend.previousPredictions += 1
      categoryTrend.previousVolume += prediction.amount
    }
  }

  for (const comment of recentCommentRows) {
    const market = comment.market
    const marketTrend = getOrCreateMarketTrend(marketTrendMap, market)
    const categoryTrend = getOrCreateCategoryTrend(categoryTrendMap, market.category)
    const isRecent = comment.createdAt >= recentStart

    if (isRecent) {
      marketTrend.recentComments += 1
      categoryTrend.recentComments += 1
    } else {
      marketTrend.previousComments += 1
      categoryTrend.previousComments += 1
    }
  }

  const marketTrends = Array.from(marketTrendMap.values()).map((market) => {
    const predictionDelta = market.recentPredictions - market.previousPredictions
    const volumeDelta = market.recentVolume - market.previousVolume
    const commentDelta = market.recentComments - market.previousComments
    const score = (
      Math.max(0, predictionDelta) * 12
      + Math.max(0, volumeDelta) / 100
      + Math.max(0, commentDelta) * 4
      + (market.createdAt >= recentStart ? 8 : 0)
    )

    return {
      ...market,
      score,
    }
  })

  const categoryTrends = Array.from(categoryTrendMap.values()).map((category) => {
    const predictionDelta = category.recentPredictions - category.previousPredictions
    const volumeDelta = category.recentVolume - category.previousVolume
    const commentDelta = category.recentComments - category.previousComments
    const score = (
      category.recentVolume
      + category.recentPredictions * 150
      + category.recentComments * 80
      + category.newMarkets * 500
      + Math.max(0, volumeDelta)
      + Math.max(0, predictionDelta) * 100
      + Math.max(0, commentDelta) * 50
    )

    return {
      ...category,
      score,
    }
  }).sort((left, right) => right.score - left.score)

  const totalRecentPredictions = categoryTrends.reduce((sum, category) => sum + category.recentPredictions, 0)
  const totalPreviousPredictions = categoryTrends.reduce((sum, category) => sum + category.previousPredictions, 0)
  const totalRecentVolume = categoryTrends.reduce((sum, category) => sum + category.recentVolume, 0)
  const totalPreviousVolume = categoryTrends.reduce((sum, category) => sum + category.previousVolume, 0)
  const totalRecentComments = categoryTrends.reduce((sum, category) => sum + category.recentComments, 0)
  const totalNewMarkets = categoryTrends.reduce((sum, category) => sum + category.newMarkets, 0)
  const hotCategory = categoryTrends[0] || null
  const maxCategoryScore = Math.max(1, ...categoryTrends.map((category) => category.score))

  const surgingMarkets = marketTrends
    .filter((market) => market.score > 0)
    .sort((left, right) => right.score - left.score || right.recentVolume - left.recentVolume)
    .slice(0, 8)
  const activeOpportunityMarkets = marketRows
    .filter((market) => market.status === 'active' && !market.hidden)
    .map((market) => {
      const totalAmount = market.options.reduce((sum, option) => sum + option.totalAmount, 0)
      const totalPredictions = market.options.reduce((sum, option) => sum + option.totalPredictions, 0)
      const daysUntilEnd = Math.max(0, Math.ceil((market.endsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      const freshnessBoost = market.createdAt >= recentStart ? 1.4 : 1
      const urgencyBoost = daysUntilEnd <= 7 ? 1.25 : 1
      const score = (totalPredictions * 100 + totalAmount + market._count.comments * 80) * freshnessBoost * urgencyBoost

      return {
        ...market,
        totalAmount,
        totalPredictions,
        daysUntilEnd,
        score,
      }
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
  const maxOpportunityScore = Math.max(1, ...activeOpportunityMarkets.map((market) => market.score))

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-black text-primary">Trend Analytics</div>
          <h1 className="mt-2 text-4xl font-black text-text-primary">트렌드 분석</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-text-secondary">
            최근 7일과 이전 7일을 비교해 인기 카테고리와 급상승 마켓을 찾습니다.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/stats/markets"
            className="inline-flex items-center justify-center rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          >
            마켓 통계
          </Link>
          <Link
            href="/admin/markets"
            className="inline-flex items-center justify-center rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white shadow-token-brand transition hover:bg-primary-dark"
          >
            마켓 관리
          </Link>
        </div>
      </header>

      <section className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-text-primary">분석 기간</div>
            <div className="mt-1 text-sm font-semibold text-text-secondary">
              최근 구간 {formatDate(recentStart)} - {formatDate(now)}
            </div>
          </div>
          <div className="text-sm font-semibold text-text-tertiary">
            비교 구간 {formatDate(previousStart)} - {formatDate(recentStart)}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="최근 예측"
          value={totalRecentPredictions.toLocaleString()}
          helper={`이전 대비 ${formatDelta(totalRecentPredictions - totalPreviousPredictions)}건`}
          tone="primary"
        />
        <StatCard
          label="최근 참여 DPMM"
          value={totalRecentVolume.toLocaleString()}
          helper={`증감률 ${formatRate(percentChange(totalRecentVolume, totalPreviousVolume))}`}
          tone="success"
        />
        <StatCard
          label="토론 반응"
          value={totalRecentComments.toLocaleString()}
          helper="최근 7일 visible 댓글"
          tone="secondary"
        />
        <StatCard
          label="인기 카테고리"
          value={hotCategory?.category || '-'}
          helper={`${totalNewMarkets.toLocaleString()}개 신규 마켓`}
          tone="warning"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">인기 카테고리</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              최근 참여, 토론, 신규 마켓을 합산한 trend score 기준
            </p>
          </div>
          {categoryTrends.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
              최근 14일 트렌드 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-3 p-5">
              {categoryTrends.slice(0, 8).map((category) => (
                <ProgressRow
                  key={category.category}
                  label={category.category}
                  value={`${Math.round(category.score).toLocaleString()} score`}
                  helper={`${category.recentPredictions.toLocaleString()}건 · ${category.recentVolume.toLocaleString()} DPMM · 댓글 ${category.recentComments.toLocaleString()}개 · 신규 ${category.newMarkets.toLocaleString()}개`}
                  percentage={(category.score / maxCategoryScore) * 100}
                  tone="primary"
                />
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">급상승 마켓</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              최근 7일 증가분과 신규 마켓 가중치 기준
            </p>
          </div>
          {surgingMarkets.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
              급상승 신호가 있는 마켓이 없습니다.
            </div>
          ) : (
            <div className="divide-y-2 divide-light-border">
              {surgingMarkets.map((market) => (
                <Link
                  key={market.id}
                  href={`/markets/${market.id}`}
                  className="grid gap-4 px-5 py-4 transition hover:bg-primary/5 md:grid-cols-[1fr_180px]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-dopameme-pill bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                        {market.category}
                      </span>
                      <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                        market.status === 'resolved' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {market.status === 'resolved' ? '확정' : '활성'}
                      </span>
                      {market.source === 'mock' && (
                        <span className="rounded-dopameme-pill bg-warning/10 px-3 py-1 text-xs font-black text-warning">
                          목업
                        </span>
                      )}
                      {market.hidden && (
                        <span className="rounded-dopameme-pill bg-gray-100 px-3 py-1 text-xs font-black text-text-tertiary">
                          숨김
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-black text-text-primary">
                      {market.title}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-text-tertiary">
                      예측 {formatDelta(market.recentPredictions - market.previousPredictions)}건 · 댓글 {formatDelta(market.recentComments - market.previousComments)}개
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left md:block md:text-right">
                    <div>
                      <div className="text-xs font-bold text-text-tertiary">score</div>
                      <div className="mt-1 text-sm font-black text-primary">
                        {Math.round(market.score).toLocaleString()}
                      </div>
                    </div>
                    <div className="md:mt-3">
                      <div className="text-xs font-bold text-text-tertiary">DPMM 증감</div>
                      <div className="mt-1 text-sm font-black text-success">
                        {formatDelta(market.recentVolume - market.previousVolume)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">운영 기회 마켓</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              활성 공개 마켓의 참여/댓글/마감 임박 신호
            </p>
          </div>
          {activeOpportunityMarkets.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
              활성 공개 마켓이 없습니다.
            </div>
          ) : (
            <div className="space-y-3 p-5">
              {activeOpportunityMarkets.map((market) => (
                <ProgressRow
                  key={market.id}
                  label={market.title}
                  value={`${Math.round(market.score).toLocaleString()} score`}
                  helper={`${market.category} · ${market.totalPredictions.toLocaleString()}건 · ${market.totalAmount.toLocaleString()} DPMM · D-${market.daysUntilEnd}`}
                  percentage={(market.score / maxOpportunityScore) * 100}
                  tone={market.daysUntilEnd <= 7 ? 'secondary' : 'success'}
                />
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">트렌드 해석</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              운영자가 바로 확인할 신호
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div className="rounded-dopameme-md border-2 border-primary/20 bg-primary/5 p-4">
              <div className="text-sm font-black text-text-primary">카테고리 집중</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                {hotCategory
                  ? `${hotCategory.category} 카테고리가 최근 구간에서 가장 높은 trend score를 보입니다. 신규 마켓이나 추천 노출 후보로 우선 검토할 수 있습니다.`
                  : '최근 구간에서 우선 검토할 카테고리 신호가 없습니다.'}
              </p>
            </div>
            <div className="rounded-dopameme-md border-2 border-secondary/20 bg-secondary/5 p-4">
              <div className="text-sm font-black text-text-primary">참여 증감</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                예측 수는 이전 구간 대비 {formatDelta(totalRecentPredictions - totalPreviousPredictions)}건,
                참여 DPMM은 {formatDelta(totalRecentVolume - totalPreviousVolume)} 변동했습니다.
              </p>
            </div>
            <div className="rounded-dopameme-md border-2 border-success/20 bg-success/5 p-4">
              <div className="text-sm font-black text-text-primary">콘텐츠 반응</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                최근 visible 댓글은 {totalRecentComments.toLocaleString()}개입니다.
                댓글과 예측이 동시에 증가한 마켓은 급상승 목록에서 우선 확인합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
