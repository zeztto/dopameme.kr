import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

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

function formatSigned(value: number) {
  return `${value > 0 ? '+' : ''}${value.toLocaleString()}`
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getRecentMonthKeys(count: number) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1)
    return monthKey(date)
  })
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
  }).format(new Date(year, month - 1, 1))
}

function predictionStatusLabel(prediction: {
  resolved: number
  market: { status: string; endsAt: Date }
}) {
  if (prediction.resolved === 1) return '적중'
  if (prediction.resolved === -1) return '실패'
  if (prediction.market.status === 'resolved') return '정산 완료'
  if (prediction.market.endsAt < new Date()) return '확정 대기'
  return '진행 중'
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
    <div className={`rounded-dopameme-lg border-3 p-6 shadow-token-sm ${toneClass(tone)}`}>
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
  const colorClass = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    neutral: 'bg-text-tertiary',
  }[tone]

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
          className={`h-full rounded-dopameme-pill ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  )
}

export default async function UserStatsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      status: true,
      dpmmBalance: true,
      createdAt: true,
    },
  })

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  const [predictions, ledgerGroups, unreadNotificationCount] = await Promise.all([
    prisma.prediction.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        liquidatedAmount: true,
        payout: true,
        resolved: true,
        createdAt: true,
        market: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            endsAt: true,
          },
        },
        option: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.dpmmLedgerTransaction.groupBy({
      by: ['type'],
      where: { userId: currentUser.id },
      _count: { _all: true },
      _sum: { delta: true },
    }),
    getUnreadNotificationCount(currentUser.id),
  ])

  const now = new Date()
  const totalPredictions = predictions.length
  const wins = predictions.filter((prediction) => prediction.resolved === 1).length
  const losses = predictions.filter((prediction) => prediction.resolved === -1).length
  const resolvedCount = wins + losses
  const activeCount = predictions.filter((prediction) => (
    prediction.resolved === 0
    && prediction.market.status === 'active'
    && prediction.market.endsAt > now
  )).length
  const pendingCount = predictions.filter((prediction) => (
    prediction.resolved === 0
    && (prediction.market.status !== 'active' || prediction.market.endsAt <= now)
  )).length

  const currentExposure = predictions
    .filter((prediction) => prediction.resolved === 0)
    .reduce((sum, prediction) => sum + prediction.amount, 0)
  const resolvedStake = predictions
    .filter((prediction) => prediction.resolved !== 0)
    .reduce((sum, prediction) => sum + prediction.amount, 0)
  const totalPayout = predictions.reduce((sum, prediction) => sum + prediction.payout, 0)
  const settledNet = totalPayout - resolvedStake
  const roi = resolvedStake > 0 ? (settledNet / resolvedStake) * 100 : 0
  const winRate = resolvedCount > 0 ? (wins / resolvedCount) * 100 : 0
  const totalLiquidated = predictions.reduce((sum, prediction) => sum + prediction.liquidatedAmount, 0)

  const ledgerCredits = ledgerGroups.reduce((sum, row) => {
    const delta = row._sum.delta || 0
    return delta > 0 ? sum + delta : sum
  }, 0)
  const ledgerDebits = ledgerGroups.reduce((sum, row) => {
    const delta = row._sum.delta || 0
    return delta < 0 ? sum + Math.abs(delta) : sum
  }, 0)
  const ledgerNet = ledgerCredits - ledgerDebits

  const categoryMap = new Map<string, {
    label: string
    count: number
    amount: number
    wins: number
    losses: number
  }>()

  const optionMap = new Map<string, {
    label: string
    count: number
    amount: number
  }>()

  for (const prediction of predictions) {
    const category = prediction.market.category || '기타'
    const categoryRow = categoryMap.get(category) || {
      label: category,
      count: 0,
      amount: 0,
      wins: 0,
      losses: 0,
    }
    categoryRow.count += 1
    categoryRow.amount += prediction.amount
    if (prediction.resolved === 1) categoryRow.wins += 1
    if (prediction.resolved === -1) categoryRow.losses += 1
    categoryMap.set(category, categoryRow)

    const option = prediction.option.title || '선택지'
    const optionRow = optionMap.get(option) || {
      label: option,
      count: 0,
      amount: 0,
    }
    optionRow.count += 1
    optionRow.amount += prediction.amount
    optionMap.set(option, optionRow)
  }

  const categoryStats = Array.from(categoryMap.values())
    .sort((left, right) => right.amount - left.amount || right.count - left.count)
    .slice(0, 6)
  const optionStats = Array.from(optionMap.values())
    .sort((left, right) => right.count - left.count || right.amount - left.amount)
    .slice(0, 6)
  const maxCategoryAmount = Math.max(1, ...categoryStats.map((item) => item.amount))
  const maxOptionCount = Math.max(1, ...optionStats.map((item) => item.count))

  const monthKeys = getRecentMonthKeys(6)
  const monthlyStats = monthKeys.map((key) => ({
    key,
    label: monthLabel(key),
    count: 0,
    amount: 0,
  }))
  const monthlyMap = new Map(monthlyStats.map((item) => [item.key, item]))

  for (const prediction of predictions) {
    const row = monthlyMap.get(monthKey(prediction.createdAt))
    if (!row) continue

    row.count += 1
    row.amount += prediction.amount
  }

  const maxMonthlyAmount = Math.max(1, ...monthlyStats.map((item) => item.amount))

  const statusRows = [
    {
      label: '진행 중',
      value: activeCount,
      tone: 'primary' as const,
    },
    {
      label: '적중',
      value: wins,
      tone: 'success' as const,
    },
    {
      label: '실패',
      value: losses,
      tone: 'secondary' as const,
    },
    {
      label: '확정 대기',
      value: pendingCount,
      tone: 'warning' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header
        userBalance={currentUser.dpmmBalance}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-20">
        <section className="mb-12 text-center">
          <div className="mb-6 inline-block">
            <span className="rounded-dopameme-pill bg-primary px-8 py-3 text-sm font-black text-white shadow-token-brand">
              통계 대시보드
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            {currentUser.name || '도파밈 유저'}님의 예측 분석
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            승률, 수익률, 예측 분포를 계정 기준으로 집계합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="총 예측"
            value={totalPredictions.toLocaleString()}
            helper={`${activeCount.toLocaleString()}개 진행 중`}
            tone="primary"
          />
          <StatCard
            label="승률"
            value={formatRate(winRate)}
            helper={`${wins.toLocaleString()}승 ${losses.toLocaleString()}패`}
            tone="success"
          />
          <StatCard
            label="정산 수익률"
            value={formatRate(roi)}
            helper={`${resolvedCount.toLocaleString()}개 확정 예측 기준`}
            tone={settledNet >= 0 ? 'success' : 'secondary'}
          />
          <StatCard
            label="현재 노출"
            value={currentExposure.toLocaleString()}
            helper="미정산 포지션 잔액"
            tone="secondary"
          />
        </section>

        <section className="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="정산 손익"
            value={formatSigned(settledNet)}
            helper={`${totalPayout.toLocaleString()} payout - ${resolvedStake.toLocaleString()} stake`}
            tone={settledNet >= 0 ? 'success' : 'secondary'}
          />
          <StatCard
            label="부분 청산"
            value={totalLiquidated.toLocaleString()}
            helper="누적 회수한 포지션 금액"
            tone="warning"
          />
          <StatCard
            label="Ledger 유입"
            value={ledgerCredits.toLocaleString()}
            helper="양수 DPMM 거래 합계"
            tone="success"
          />
          <StatCard
            label="Ledger 순변동"
            value={formatSigned(ledgerNet)}
            helper={`${ledgerDebits.toLocaleString()} DPMM 유출 반영`}
            tone={ledgerNet >= 0 ? 'primary' : 'secondary'}
          />
        </section>

        <section className="mb-12 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">예측 상태 분포</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                전체 예측 {totalPredictions.toLocaleString()}개 기준
              </p>
            </div>
            <div className="space-y-3 p-5">
              {statusRows.map((row) => (
                <ProgressRow
                  key={row.label}
                  label={row.label}
                  value={row.value.toLocaleString()}
                  helper={totalPredictions > 0 ? formatRate((row.value / totalPredictions) * 100) : '0%'}
                  percentage={totalPredictions > 0 ? (row.value / totalPredictions) * 100 : 0}
                  tone={row.tone}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">최근 6개월 예측 추세</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                월별 참여 DPMM과 예측 수
              </p>
            </div>
            <div className="grid min-h-72 grid-cols-6 items-end gap-3 p-5">
              {monthlyStats.map((month) => (
                <div key={month.key} className="flex h-full flex-col justify-end gap-3">
                  <div className="flex min-h-48 flex-col justify-end rounded-dopameme-md bg-light-bg-alt px-2 py-3">
                    <div
                      className="mx-auto w-full rounded-dopameme-md bg-primary"
                      style={{
                        height: month.amount > 0
                          ? `${Math.max(4, (month.amount / maxMonthlyAmount) * 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-text-primary">{month.label}</div>
                    <div className="mt-1 text-xs font-bold text-text-tertiary">
                      {month.count.toLocaleString()}건
                    </div>
                    <div className="mt-1 text-xs font-bold text-secondary">
                      {month.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">카테고리 분포</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                참여 DPMM 기준 상위 카테고리
              </p>
            </div>
            {categoryStats.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
                아직 예측 데이터가 없습니다.
              </div>
            ) : (
              <div className="space-y-3 p-5">
                {categoryStats.map((category) => {
                  const categoryResolved = category.wins + category.losses
                  const categoryWinRate = categoryResolved > 0
                    ? (category.wins / categoryResolved) * 100
                    : 0

                  return (
                    <ProgressRow
                      key={category.label}
                      label={category.label}
                      value={`${category.amount.toLocaleString()} DPMM`}
                      helper={`${category.count.toLocaleString()}건 · 승률 ${formatRate(categoryWinRate)}`}
                      percentage={(category.amount / maxCategoryAmount) * 100}
                      tone="primary"
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">선택지 성향</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                선택한 옵션명 기준 상위 분포
              </p>
            </div>
            {optionStats.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
                아직 선택지 데이터가 없습니다.
              </div>
            ) : (
              <div className="space-y-3 p-5">
                {optionStats.map((option) => (
                  <ProgressRow
                    key={option.label}
                    label={option.label}
                    value={`${option.count.toLocaleString()}건`}
                    helper={`${option.amount.toLocaleString()} DPMM 참여`}
                    percentage={(option.count / maxOptionCount) * 100}
                    tone="secondary"
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
          <div className="flex flex-col gap-3 border-b-3 border-light-border bg-light-bg-alt px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">최근 분석 대상</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                최신 예측 8개 상태 확인
              </p>
            </div>
            <Link href="/markets" className="text-sm font-black text-primary hover:text-primary-dark">
              마켓 보기
            </Link>
          </div>

          {predictions.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <h3 className="text-2xl font-black text-text-primary">
                아직 집계할 예측이 없습니다
              </h3>
              <p className="mt-3 text-base font-semibold text-text-secondary">
                예측 시장에서 첫 포지션을 만들면 통계가 채워집니다.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-light-border">
              {predictions.slice(0, 8).map((prediction) => (
                <Link
                  key={prediction.id}
                  href={`/markets/${prediction.market.id}`}
                  className="grid gap-4 px-5 py-4 transition hover:bg-primary/5 md:grid-cols-[1fr_180px]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-dopameme-pill bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                        {prediction.market.category}
                      </span>
                      <span className="text-xs font-bold text-text-tertiary">
                        {formatDate(prediction.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-black text-text-primary">
                      {prediction.market.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-text-secondary">
                      선택: {prediction.option.title} · {predictionStatusLabel(prediction)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left md:text-right">
                    <div>
                      <div className="text-xs font-bold text-text-tertiary">포지션</div>
                      <div className="mt-1 text-sm font-black text-secondary">
                        {prediction.amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-tertiary">payout</div>
                      <div className="mt-1 text-sm font-black text-success">
                        {prediction.payout.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-dopameme-xl border-3 border-primary/25 bg-primary/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">다음 행동</h2>
              <p className="mt-2 text-sm font-semibold text-text-secondary">
                분석 결과를 보고 새 예측에 참여하거나 내 활동으로 돌아갑니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                내 활동
              </Link>
              <Link
                href="/app/achievements"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                업적
              </Link>
              <Link
                href="/app/level"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                레벨
              </Link>
              <Link
                href="/app/seasons"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                시즌
              </Link>
              <Link
                href="/markets"
                className="rounded-dopameme-pill bg-secondary px-6 py-3 text-center text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark"
              >
                예측 시장
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
