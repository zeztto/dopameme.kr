import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type StatCardProps = {
  label: string
  value: string
  helper: string
  tone?: 'primary' | 'secondary' | 'success' | 'neutral'
}

function StatCard({ label, value, helper, tone = 'neutral' }: StatCardProps) {
  const toneClass = {
    primary: 'border-primary/25 bg-primary/5 text-primary',
    secondary: 'border-secondary/25 bg-secondary/5 text-secondary',
    success: 'border-success/25 bg-success/5 text-success',
    neutral: 'border-light-border bg-white text-text-primary',
  }[tone]

  return (
    <div className={`rounded-dopameme-lg border-3 p-5 shadow-token-sm ${toneClass}`}>
      <div className="text-sm font-black text-text-tertiary">{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function AdminDashboardPage() {
  const now = new Date()

  const [
    totalMarkets,
    activeMarkets,
    resolvedMarkets,
    hiddenMarkets,
    mockMarkets,
    endedOpenMarkets,
    totalLiquidity,
    userCount,
    adminCount,
    predictionCount,
    predictionVolume,
    recentMarkets,
    categoryCounts,
    categoryActiveCounts,
    categoryMockCounts,
  ] =
    await Promise.all([
      prisma.market.count(),
      prisma.market.count({ where: { status: 'active' } }),
      prisma.market.count({ where: { status: 'resolved' } }),
      prisma.market.count({ where: { hidden: true } }),
      prisma.market.count({ where: { source: 'mock' } }),
      prisma.market.count({
        where: {
          status: 'active',
          endsAt: { lt: now },
        },
      }),
      prisma.marketOption.aggregate({ _sum: { totalAmount: true } }),
      prisma.user.count({ where: { role: { not: 'system' } } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.prediction.count(),
      prisma.prediction.aggregate({ _sum: { amount: true } }),
      prisma.market.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          source: true,
          hidden: true,
          endsAt: true,
          _count: {
            select: {
              predictions: true,
            },
          },
        },
      }),
      prisma.market.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      prisma.market.groupBy({
        by: ['category'],
        where: { status: 'active' },
        _count: { _all: true },
      }),
      prisma.market.groupBy({
        by: ['category'],
        where: { source: 'mock' },
        _count: { _all: true },
      }),
    ])

  const categoryActiveMap = new Map(
    categoryActiveCounts.map((item) => [item.category, item._count._all])
  )
  const categoryMockMap = new Map(
    categoryMockCounts.map((item) => [item.category, item._count._all])
  )
  const categories = categoryCounts
    .map((item) => ({
      category: item.category,
      count: item._count._all,
      active: categoryActiveMap.get(item.category) || 0,
      mock: categoryMockMap.get(item.category) || 0,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-black text-primary">Admin Dashboard</div>
          <h1 className="mt-2 text-4xl font-black text-text-primary">운영 현황</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-text-secondary">
            마켓, 목업 데이터, 예측 참여 상태를 한 화면에서 확인합니다.
          </p>
        </div>
        <Link
          href="/admin/markets/create"
          className="inline-flex items-center justify-center rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white shadow-token-brand transition hover:bg-primary-dark"
        >
          새 마켓 생성
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="전체 마켓" value={totalMarkets.toLocaleString()} helper={`${activeMarkets}개 활성`} tone="primary" />
        <StatCard label="목업 마켓" value={mockMarkets.toLocaleString()} helper="seed 데이터 표시" tone="secondary" />
        <StatCard label="참여 건수" value={predictionCount.toLocaleString()} helper={`${(predictionVolume._sum.amount || 0).toLocaleString()} DPMM 누적`} tone="success" />
        <StatCard label="사용자" value={userCount.toLocaleString()} helper={`${adminCount}명 관리자`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="flex items-center justify-between border-b-2 border-light-border px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-text-primary">최근 마켓</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                운영/목업 마켓의 최신 등록 상태
              </p>
            </div>
            <Link href="/admin/markets" className="text-sm font-black text-primary hover:text-primary-dark">
              전체 보기
            </Link>
          </div>
          <div className="divide-y-2 divide-light-border">
            {recentMarkets.map((market) => (
              <Link
                key={market.id}
                href={`/markets/${market.id}`}
                className="grid gap-3 px-5 py-4 transition hover:bg-primary/5 md:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-dopameme-pill bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                      {market.category}
                    </span>
                    <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                      market.source === 'mock'
                        ? 'bg-accent-yellow/15 text-accent-yellow'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {market.source === 'mock' ? '목업' : '운영'}
                    </span>
                    {market.hidden && (
                      <span className="rounded-dopameme-pill bg-gray-100 px-3 py-1 text-xs font-black text-text-tertiary">
                        숨김
                      </span>
                    )}
                  </div>
                  <div className="mt-2 truncate text-base font-black text-text-primary">
                    {market.title}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-text-tertiary">
                    {formatDate(market.endsAt)} 마감
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-sm font-black text-text-primary">
                    {market._count.predictions.toLocaleString()}건
                  </div>
                  <div className="mt-1 text-xs font-bold text-text-tertiary">
                    {market.status === 'resolved' ? '확정' : '활성'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
            <h2 className="text-lg font-black text-text-primary">운영 큐</h2>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-dopameme-md bg-light-bg-alt px-4 py-3">
                <span className="text-sm font-bold text-text-secondary">확정 대기</span>
                <span className="text-xl font-black text-secondary">{endedOpenMarkets}</span>
              </div>
              <div className="flex items-center justify-between rounded-dopameme-md bg-light-bg-alt px-4 py-3">
                <span className="text-sm font-bold text-text-secondary">숨김 마켓</span>
                <span className="text-xl font-black text-text-primary">{hiddenMarkets}</span>
              </div>
              <div className="flex items-center justify-between rounded-dopameme-md bg-light-bg-alt px-4 py-3">
                <span className="text-sm font-bold text-text-secondary">확정 완료</span>
                <span className="text-xl font-black text-success">{resolvedMarkets}</span>
              </div>
              <div className="flex items-center justify-between rounded-dopameme-md bg-light-bg-alt px-4 py-3">
                <span className="text-sm font-bold text-text-secondary">총 유동성</span>
                <span className="text-xl font-black text-primary">{(totalLiquidity._sum.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
            <h2 className="text-lg font-black text-text-primary">카테고리 분포</h2>
            <div className="mt-5 space-y-3">
              {categories.map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex items-center justify-between text-sm font-bold">
                    <span className="text-text-secondary">{item.category}</span>
                    <span className="text-text-primary">{item.count}개</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-dopameme-pill bg-light-bg-alt">
                    <div
                      className="h-full rounded-dopameme-pill bg-primary"
                      style={{ width: `${Math.max(8, Math.round((item.count / Math.max(totalMarkets, 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs font-semibold text-text-tertiary">
                    활성 {item.active}개 · 목업 {item.mock}개
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
