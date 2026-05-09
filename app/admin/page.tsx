import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
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

function withdrawalStatusLabel(status: string) {
  if (status === 'pending') return '검토 대기'
  if (status === 'approved') return '승인'
  if (status === 'submitted') return '전송됨'
  if (status === 'confirmed') return '확정'
  if (status === 'rejected') return '거절'
  if (status === 'failed') return '실패'
  return status
}

function withdrawalStatusClass(status: string) {
  if (status === 'pending') return 'bg-accent-yellow/15 text-accent-yellow'
  if (status === 'approved') return 'bg-primary/10 text-primary'
  if (status === 'submitted') return 'bg-accent-cyan/10 text-accent-cyan'
  if (status === 'confirmed') return 'bg-success/10 text-success'
  if (status === 'rejected' || status === 'failed') return 'bg-secondary/10 text-secondary'
  return 'bg-light-bg-alt text-text-secondary'
}

function ledgerTypeLabel(type: string) {
  if (type === 'opening_balance') return '초기 잔액'
  if (type === 'welcome_bonus') return '웰컴 보너스'
  if (type === 'admin_adjustment') return '관리자 조정'
  if (type === 'prediction_stake') return '예측 참여'
  if (type === 'market_payout') return '정산 보상'
  if (type === 'market_fee') return '정산 수수료'
  if (type === 'withdrawal_request') return '출금 요청'
  if (type === 'withdrawal_refund') return '출금 복원'
  return type
}

function DeltaText({ delta }: { delta: number }) {
  return (
    <span className={delta >= 0 ? 'text-success' : 'text-secondary'}>
      {delta > 0 ? '+' : ''}{delta.toLocaleString()}
    </span>
  )
}

async function requireDashboardAdmin() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      status: true,
    },
  })

  if (user?.status !== 'active') {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/markets')
  }
}

export default async function AdminDashboardPage() {
  await requireDashboardAdmin()

  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

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
    withdrawalStatusCounts,
    activeWithdrawalAmount,
    recentWithdrawalQueue,
    ledgerCount,
    ledger24hCount,
    ledgerCredits,
    ledgerDebits,
    recentLedger,
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
      prisma.solanaWithdrawalRequest.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.solanaWithdrawalRequest.aggregate({
        where: { status: { in: ['pending', 'approved', 'submitted'] } },
        _sum: { amount: true },
      }),
      prisma.solanaWithdrawalRequest.findMany({
        where: { status: { in: ['pending', 'approved', 'submitted'] } },
        take: 5,
        orderBy: { requestedAt: 'asc' },
        select: {
          id: true,
          amount: true,
          status: true,
          requestedAt: true,
          walletAddress: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.dpmmLedgerTransaction.count(),
      prisma.dpmmLedgerTransaction.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.dpmmLedgerTransaction.aggregate({
        where: { delta: { gt: 0 } },
        _sum: { delta: true },
      }),
      prisma.dpmmLedgerTransaction.aggregate({
        where: { delta: { lt: 0 } },
        _sum: { delta: true },
      }),
      prisma.dpmmLedgerTransaction.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          delta: true,
          balanceAfter: true,
          reason: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          actor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
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
  const withdrawalStatusMap = new Map(
    withdrawalStatusCounts.map((item) => [item.status, item._count._all])
  )
  const pendingWithdrawalCount = withdrawalStatusMap.get('pending') || 0
  const approvedWithdrawalCount = withdrawalStatusMap.get('approved') || 0
  const submittedWithdrawalCount = withdrawalStatusMap.get('submitted') || 0
  const confirmedWithdrawalCount = withdrawalStatusMap.get('confirmed') || 0
  const activeWithdrawalCount =
    pendingWithdrawalCount + approvedWithdrawalCount + submittedWithdrawalCount
  const totalLedgerCredits = ledgerCredits._sum.delta || 0
  const totalLedgerDebits = Math.abs(ledgerDebits._sum.delta || 0)
  const ledgerNet = totalLedgerCredits - totalLedgerDebits

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="출금 처리중"
          value={activeWithdrawalCount.toLocaleString()}
          helper={`${pendingWithdrawalCount}건 검토 · ${approvedWithdrawalCount}건 승인`}
          tone="secondary"
        />
        <StatCard
          label="잠긴 DPMM"
          value={(activeWithdrawalAmount._sum.amount || 0).toLocaleString()}
          helper={`${submittedWithdrawalCount}건 전송 · ${confirmedWithdrawalCount}건 확정`}
          tone="primary"
        />
        <StatCard
          label="Ledger 거래"
          value={ledgerCount.toLocaleString()}
          helper={`최근 24시간 ${ledger24hCount.toLocaleString()}건`}
          tone="success"
        />
        <StatCard
          label="Ledger 순증감"
          value={ledgerNet.toLocaleString()}
          helper={`유입 ${totalLedgerCredits.toLocaleString()} · 사용 ${totalLedgerDebits.toLocaleString()}`}
        />
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

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="flex items-center justify-between border-b-2 border-light-border px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-text-primary">출금 운영 큐</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                오래된 처리중 요청 5건
              </p>
            </div>
            <Link href="/admin/withdrawals" className="text-sm font-black text-primary hover:text-primary-dark">
              전체 보기
            </Link>
          </div>
          <div className="divide-y-2 divide-light-border">
            {recentWithdrawalQueue.length ? recentWithdrawalQueue.map((request) => (
              <Link
                key={request.id}
                href="/admin/withdrawals"
                className="block px-5 py-4 transition hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-base font-black text-text-primary">
                      {request.amount.toLocaleString()} DPMM
                    </div>
                    <div className="mt-1 text-sm font-semibold text-text-secondary">
                      {request.user.name || request.user.email || '회원'}
                    </div>
                    <div className="mt-2 break-all font-mono text-xs text-text-tertiary">
                      {request.walletAddress}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${withdrawalStatusClass(request.status)}`}>
                      {withdrawalStatusLabel(request.status)}
                    </span>
                    <div className="mt-2 text-xs font-bold text-text-tertiary">
                      {formatDate(request.requestedAt)}
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="px-5 py-12 text-center text-sm font-semibold text-text-secondary">
                처리 중인 출금 요청이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="flex items-center justify-between border-b-2 border-light-border px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-text-primary">최근 DPMM Ledger</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                최신 장부 거래 6건
              </p>
            </div>
            <Link href="/admin/users" className="text-sm font-black text-primary hover:text-primary-dark">
              회원 관리
            </Link>
          </div>
          <div className="divide-y-2 divide-light-border">
            {recentLedger.length ? recentLedger.map((entry) => (
              <div key={entry.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-dopameme-pill bg-light-bg-alt px-3 py-1 text-xs font-black text-text-secondary">
                      {ledgerTypeLabel(entry.type)}
                    </span>
                    <span className="text-xs font-bold text-text-tertiary">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-black text-text-primary">
                    {entry.user.name || entry.user.email || '회원'}
                  </div>
                  {entry.reason && (
                    <div className="mt-1 line-clamp-2 text-xs font-semibold text-text-secondary">
                      {entry.reason}
                    </div>
                  )}
                  {entry.actor && (
                    <div className="mt-1 text-xs font-semibold text-text-tertiary">
                      actor {entry.actor.name || entry.actor.email || '관리자'}
                    </div>
                  )}
                </div>
                <div className="text-left md:text-right">
                  <div className="text-base font-black">
                    <DeltaText delta={entry.delta} />
                  </div>
                  <div className="mt-1 text-xs font-bold text-text-tertiary">
                    잔액 {entry.balanceAfter.toLocaleString()}
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-5 py-12 text-center text-sm font-semibold text-text-secondary">
                ledger 기록이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
