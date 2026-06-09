import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatRate(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return `${value.toFixed(1).replace(/\.0$/, '')}%`
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

function getTopOption(options: Array<{ id: string; totalAmount: number; totalPredictions: number }>) {
  return [...options].sort((left, right) => (
    right.totalAmount - left.totalAmount || right.totalPredictions - left.totalPredictions
  ))[0] || null
}

export default async function AdminMarketStatsPage() {
  const now = new Date()

  const markets = await prisma.market.findMany({
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
      winningOptionId: true,
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
          id: true,
          userId: true,
          optionId: true,
          amount: true,
          payout: true,
          resolved: true,
          createdAt: true,
        },
      },
    },
  })

  const totalMarkets = markets.length
  const activeMarkets = markets.filter((market) => market.status === 'active').length
  const resolvedMarkets = markets.filter((market) => market.status === 'resolved')
  const hiddenMarkets = markets.filter((market) => market.hidden).length
  const mockMarkets = markets.filter((market) => market.source === 'mock').length
  const endedActiveMarkets = markets.filter((market) => (
    market.status === 'active' && market.endsAt <= now
  ))
  const allPredictions = markets.flatMap((market) => market.predictions)
  const totalPredictions = allPredictions.length
  const totalVolume = markets.reduce((sum, market) => (
    sum + market.options.reduce((optionSum, option) => optionSum + option.totalAmount, 0)
  ), 0)
  const uniqueParticipants = new Set(allPredictions.map((prediction) => prediction.userId)).size
  const participantMarketMap = new Map<string, Set<string>>()

  for (const market of markets) {
    for (const prediction of market.predictions) {
      const marketSet = participantMarketMap.get(prediction.userId) || new Set<string>()
      marketSet.add(market.id)
      participantMarketMap.set(prediction.userId, marketSet)
    }
  }

  const repeatParticipants = Array.from(participantMarketMap.values())
    .filter((marketSet) => marketSet.size > 1)
    .length
  const repeatParticipantRate = uniqueParticipants > 0
    ? (repeatParticipants / uniqueParticipants) * 100
    : 0

  const resolvedPredictions = allPredictions.filter((prediction) => prediction.resolved !== 0)
  const winningPredictions = resolvedPredictions.filter((prediction) => prediction.resolved === 1)
  const userAccuracy = resolvedPredictions.length > 0
    ? (winningPredictions.length / resolvedPredictions.length) * 100
    : 0
  const resolvedStake = resolvedPredictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const resolvedPayout = resolvedPredictions.reduce((sum, prediction) => sum + prediction.payout, 0)
  const platformFeeEstimate = Math.max(0, resolvedStake - resolvedPayout)
  const averagePredictionsPerMarket = totalMarkets > 0
    ? totalPredictions / totalMarkets
    : 0

  const resolvedMarketsWithWinner = resolvedMarkets.filter((market) => Boolean(market.winningOptionId))
  const crowdCorrectMarkets = resolvedMarketsWithWinner.filter((market) => {
    const topOption = getTopOption(market.options)
    return topOption?.id === market.winningOptionId
  })
  const crowdAccuracy = resolvedMarketsWithWinner.length > 0
    ? (crowdCorrectMarkets.length / resolvedMarketsWithWinner.length) * 100
    : 0

  const categoryMap = new Map<string, {
    category: string
    markets: number
    active: number
    resolved: number
    predictions: number
    volume: number
    winners: number
    resolvedPredictions: number
  }>()

  for (const market of markets) {
    const row = categoryMap.get(market.category) || {
      category: market.category,
      markets: 0,
      active: 0,
      resolved: 0,
      predictions: 0,
      volume: 0,
      winners: 0,
      resolvedPredictions: 0,
    }
    const marketVolume = market.options.reduce((sum, option) => sum + option.totalAmount, 0)
    const marketResolvedPredictions = market.predictions.filter((prediction) => prediction.resolved !== 0)

    row.markets += 1
    row.active += market.status === 'active' ? 1 : 0
    row.resolved += market.status === 'resolved' ? 1 : 0
    row.predictions += market.predictions.length
    row.volume += marketVolume
    row.winners += marketResolvedPredictions.filter((prediction) => prediction.resolved === 1).length
    row.resolvedPredictions += marketResolvedPredictions.length
    categoryMap.set(market.category, row)
  }

  const categoryStats = Array.from(categoryMap.values())
    .sort((left, right) => right.volume - left.volume || right.predictions - left.predictions)
  const maxCategoryVolume = Math.max(1, ...categoryStats.map((row) => row.volume))

  const marketRows = markets.map((market) => {
    const volume = market.options.reduce((sum, option) => sum + option.totalAmount, 0)
    const resolvedMarketPredictions = market.predictions.filter((prediction) => prediction.resolved !== 0)
    const wins = resolvedMarketPredictions.filter((prediction) => prediction.resolved === 1).length
    const accuracy = resolvedMarketPredictions.length > 0
      ? (wins / resolvedMarketPredictions.length) * 100
      : 0
    const topOption = getTopOption(market.options)
    const crowdPickedWinner = market.status === 'resolved' && topOption?.id === market.winningOptionId

    return {
      id: market.id,
      title: market.title,
      category: market.category,
      status: market.status,
      source: market.source,
      hidden: market.hidden,
      endsAt: market.endsAt,
      predictions: market.predictions.length,
      participants: new Set(market.predictions.map((prediction) => prediction.userId)).size,
      volume,
      accuracy,
      topOptionTitle: market.options.find((option) => option.id === topOption?.id)?.title || '-',
      crowdPickedWinner,
    }
  })

  const topMarketsByVolume = [...marketRows]
    .sort((left, right) => right.volume - left.volume || right.predictions - left.predictions)
    .slice(0, 8)
  const topMarketsByParticipants = [...marketRows]
    .sort((left, right) => right.participants - left.participants || right.volume - left.volume)
    .slice(0, 8)
  const endingSoonMarkets = marketRows
    .filter((market) => market.status === 'active' && market.endsAt > now && !market.hidden)
    .sort((left, right) => left.endsAt.getTime() - right.endsAt.getTime())
    .slice(0, 6)

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-black text-primary">Market Analytics</div>
          <h1 className="mt-2 text-4xl font-black text-text-primary">마켓 통계</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-text-secondary">
            마켓별 예측 정확도, 참여자 분포, 카테고리 성과를 운영 기준으로 확인합니다.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/stats/trends"
            className="inline-flex items-center justify-center rounded-dopameme-pill border-3 border-secondary bg-white px-6 py-3 text-sm font-black text-secondary transition hover:bg-secondary hover:text-white"
          >
            트렌드 분석
          </Link>
          <Link
            href="/admin/markets"
            className="inline-flex items-center justify-center rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          >
            마켓 관리
          </Link>
          <Link
            href="/admin/markets/create"
            className="inline-flex items-center justify-center rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white shadow-token-brand transition hover:bg-primary-dark"
          >
            새 마켓 생성
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="전체 마켓"
          value={totalMarkets.toLocaleString()}
          helper={`${activeMarkets.toLocaleString()}개 활성 · ${resolvedMarkets.length.toLocaleString()}개 확정`}
          tone="primary"
        />
        <StatCard
          label="예측 정확도"
          value={formatRate(userAccuracy)}
          helper={`${winningPredictions.length.toLocaleString()}건 적중 / ${resolvedPredictions.length.toLocaleString()}건 확정`}
          tone="success"
        />
        <StatCard
          label="군중 예측 적중"
          value={formatRate(crowdAccuracy)}
          helper={`${crowdCorrectMarkets.length.toLocaleString()}개 / ${resolvedMarketsWithWinner.length.toLocaleString()}개 resolved market`}
          tone="secondary"
        />
        <StatCard
          label="고유 참여자"
          value={uniqueParticipants.toLocaleString()}
          helper={`반복 참여율 ${formatRate(repeatParticipantRate)}`}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="총 참여"
          value={totalPredictions.toLocaleString()}
          helper={`마켓당 평균 ${averagePredictionsPerMarket.toFixed(1).replace(/\.0$/, '')}건`}
          tone="primary"
        />
        <StatCard
          label="마켓 유동성"
          value={totalVolume.toLocaleString()}
          helper="현재 옵션 총액 합계"
          tone="success"
        />
        <StatCard
          label="정산 수수료 추정"
          value={platformFeeEstimate.toLocaleString()}
          helper={`${resolvedStake.toLocaleString()} stake - ${resolvedPayout.toLocaleString()} payout`}
          tone="warning"
        />
        <StatCard
          label="운영 확인 필요"
          value={endedActiveMarkets.length.toLocaleString()}
          helper={`${hiddenMarkets.toLocaleString()}개 숨김 · ${mockMarkets.toLocaleString()}개 목업`}
          tone="secondary"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">참여 규모 상위 마켓</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              현재 옵션 총액 기준 상위 8개
            </p>
          </div>
          <div className="divide-y-2 divide-light-border">
            {topMarketsByVolume.map((market) => (
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
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-base font-black text-text-primary">
                    {market.title}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-text-tertiary">
                    최다 선택: {market.topOptionTitle}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left md:block md:text-right">
                  <div>
                    <div className="text-xs font-bold text-text-tertiary">유동성</div>
                    <div className="mt-1 text-sm font-black text-primary">
                      {market.volume.toLocaleString()}
                    </div>
                  </div>
                  <div className="md:mt-3">
                    <div className="text-xs font-bold text-text-tertiary">참여자</div>
                    <div className="mt-1 text-sm font-black text-text-primary">
                      {market.participants.toLocaleString()}명
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">카테고리 분석</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              참여 DPMM과 확정 예측 적중률
            </p>
          </div>
          <div className="space-y-3 p-5">
            {categoryStats.map((category) => {
              const accuracy = category.resolvedPredictions > 0
                ? (category.winners / category.resolvedPredictions) * 100
                : 0

              return (
                <ProgressRow
                  key={category.category}
                  label={category.category}
                  value={`${category.volume.toLocaleString()} DPMM`}
                  helper={`${category.markets.toLocaleString()}개 마켓 · ${category.predictions.toLocaleString()}건 · 적중률 ${formatRate(accuracy)}`}
                  percentage={(category.volume / maxCategoryVolume) * 100}
                  tone="primary"
                />
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">참여자 집중 마켓</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              고유 참여자 수 기준 상위 8개
            </p>
          </div>
          <div className="divide-y-2 divide-light-border">
            {topMarketsByParticipants.map((market) => (
              <Link
                key={market.id}
                href={`/markets/${market.id}`}
                className="grid gap-3 px-5 py-4 transition hover:bg-primary/5 md:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-text-primary">{market.title}</div>
                  <div className="mt-1 text-xs font-bold text-text-tertiary">
                    {market.category} · {market.predictions.toLocaleString()}건 참여
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-base font-black text-primary">
                    {market.participants.toLocaleString()}명
                  </div>
                  <div className="mt-1 text-xs font-bold text-text-tertiary">
                    정확도 {formatRate(market.accuracy)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border bg-light-bg-alt px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">운영 모니터링</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              마감 임박 및 결과 확정 필요 마켓
            </p>
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-black text-text-primary">확정 필요</h3>
              <div className="space-y-3">
                {endedActiveMarkets.length === 0 ? (
                  <div className="rounded-dopameme-md bg-light-bg-alt px-4 py-6 text-center text-sm font-semibold text-text-secondary">
                    마감 후 활성 상태인 마켓이 없습니다.
                  </div>
                ) : endedActiveMarkets.slice(0, 6).map((market) => (
                  <Link
                    key={market.id}
                    href={`/markets/${market.id}`}
                    className="block rounded-dopameme-md border-2 border-secondary/20 bg-secondary/5 px-4 py-3 transition hover:border-secondary"
                  >
                    <div className="line-clamp-2 text-sm font-black text-text-primary">
                      {market.title}
                    </div>
                    <div className="mt-1 text-xs font-bold text-secondary">
                      {formatDate(market.endsAt)} 마감
                    </div>
                  </Link>
                ))
                }
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-black text-text-primary">마감 임박</h3>
              <div className="space-y-3">
                {endingSoonMarkets.length === 0 ? (
                  <div className="rounded-dopameme-md bg-light-bg-alt px-4 py-6 text-center text-sm font-semibold text-text-secondary">
                    공개 활성 마켓이 없습니다.
                  </div>
                ) : endingSoonMarkets.map((market) => (
                  <Link
                    key={market.id}
                    href={`/markets/${market.id}`}
                    className="block rounded-dopameme-md border-2 border-light-border bg-white px-4 py-3 transition hover:border-primary"
                  >
                    <div className="line-clamp-2 text-sm font-black text-text-primary">
                      {market.title}
                    </div>
                    <div className="mt-1 text-xs font-bold text-text-tertiary">
                      {formatDate(market.endsAt)} · {market.participants.toLocaleString()}명 참여
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
