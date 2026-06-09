import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function ledgerTypeLabel(type: string) {
  if (type === 'opening_balance') return '초기 잔액'
  if (type === 'welcome_bonus') return '웰컴 보너스'
  if (type === 'admin_adjustment') return '관리자 조정'
  if (type === 'prediction_stake') return '예측 참여'
  if (type === 'prediction_liquidation') return '부분 청산'
  if (type === 'prediction_liquidation_fee') return '청산 수수료'
  if (type === 'position_purchase') return '포지션 구매'
  if (type === 'position_sale') return '포지션 판매'
  if (type === 'position_sale_fee') return '양도 수수료'
  if (type === 'market_payout') return '정산 보상'
  if (type === 'market_fee') return '정산 수수료'
  if (type === 'withdrawal_request') return '출금 요청'
  if (type === 'withdrawal_refund') return '출금 복원'
  if (type === 'level_reward') return '레벨 보상'
  if (type === 'item_purchase') return '아이템 구매'
  return type
}

function userLedgerReason(type: string, reason: string | null) {
  if (!reason || type === 'admin_adjustment') return null
  return reason
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

function predictionStatusClass(resolved: number) {
  if (resolved === 1) return 'bg-success/10 text-success'
  if (resolved === -1) return 'bg-secondary/10 text-secondary'
  return 'bg-primary/10 text-primary'
}

function DeltaText({ delta }: { delta: number }) {
  return (
    <span className={delta >= 0 ? 'text-success' : 'text-secondary'}>
      {delta > 0 ? '+' : ''}{delta.toLocaleString()}
    </span>
  )
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
  tone?: 'primary' | 'secondary' | 'success' | 'neutral'
}) {
  const toneClass = {
    primary: 'border-primary/25 bg-primary/5 text-primary',
    secondary: 'border-secondary/25 bg-secondary/5 text-secondary',
    success: 'border-success/25 bg-success/5 text-success',
    neutral: 'border-light-border bg-white text-text-primary',
  }[tone]

  return (
    <div className={`rounded-dopameme-lg border-3 p-6 shadow-token-sm ${toneClass}`}>
      <div className="text-sm font-black text-text-tertiary">{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

export default async function DashboardPage() {
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
      role: true,
      dpmmBalance: true,
      createdAt: true,
    },
  })

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  const leaderboardWhere = {
    status: 'active',
    role: { not: 'system' },
  }

  const [
    activePredictionCount,
    totalPredictionCount,
    winCount,
    lossCount,
    predictionVolume,
    payoutTotal,
    recentPredictions,
    recentLedger,
    unreadNotificationCount,
    totalUsers,
    higherRankedUsers,
  ] = await Promise.all([
    prisma.prediction.count({
      where: {
        userId: currentUser.id,
        market: { status: 'active' },
      },
    }),
    prisma.prediction.count({ where: { userId: currentUser.id } }),
    prisma.prediction.count({ where: { userId: currentUser.id, resolved: 1 } }),
    prisma.prediction.count({ where: { userId: currentUser.id, resolved: -1 } }),
    prisma.prediction.aggregate({
      where: { userId: currentUser.id },
      _sum: { amount: true },
    }),
    prisma.prediction.aggregate({
      where: { userId: currentUser.id },
      _sum: { payout: true },
    }),
    prisma.prediction.findMany({
      where: { userId: currentUser.id },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        payout: true,
        resolved: true,
        createdAt: true,
        market: {
          select: {
            id: true,
            title: true,
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
    prisma.dpmmLedgerTransaction.findMany({
      where: { userId: currentUser.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        delta: true,
        balanceAfter: true,
        reason: true,
        createdAt: true,
      },
    }),
    getUnreadNotificationCount(currentUser.id),
    prisma.user.count({ where: leaderboardWhere }),
    prisma.user.count({
      where: {
        ...leaderboardWhere,
        OR: [
          { dpmmBalance: { gt: currentUser.dpmmBalance } },
          {
            dpmmBalance: currentUser.dpmmBalance,
            createdAt: { lt: currentUser.createdAt },
          },
          {
            dpmmBalance: currentUser.dpmmBalance,
            createdAt: currentUser.createdAt,
            id: { lt: currentUser.id },
          },
        ],
      },
    }),
  ])

  const myRank = higherRankedUsers + 1
  const winRate = winCount + lossCount > 0
    ? Math.round((winCount / (winCount + lossCount)) * 100)
    : 0
  const totalStaked = predictionVolume._sum.amount || 0
  const totalPayout = payoutTotal._sum.payout || 0
  const netPredictionResult = totalPayout - totalStaked

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
              내 활동
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            {currentUser.name || '도파밈 유저'}님의 활동 현황
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            예측 참여, DPMM 흐름, 랭킹을 한 화면에서 확인합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="보유 DPMM"
            value={currentUser.dpmmBalance.toLocaleString()}
            helper={currentUser.dpmmBalance === 10000 ? '웰컴 보너스 기준' : '장부 기준 현재 잔액'}
            tone="primary"
          />
          <StatCard
            label="참여 중인 예측"
            value={activePredictionCount.toLocaleString()}
            helper={`${totalPredictionCount.toLocaleString()}개 전체 참여`}
            tone="success"
          />
          <StatCard
            label="내 랭킹"
            value={`${myRank.toLocaleString()}위`}
            helper={`전체 ${totalUsers.toLocaleString()}명 중`}
            tone="secondary"
          />
          <StatCard
            label="승률"
            value={`${winRate}%`}
            helper={`${winCount.toLocaleString()}승 ${lossCount.toLocaleString()}패`}
          />
        </section>

        <section className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">누적 참여 DPMM</div>
            <div className="mt-3 text-2xl font-black text-secondary">
              {totalStaked.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">예측 stake 합계</div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">누적 정산 DPMM</div>
            <div className="mt-3 text-2xl font-black text-success">
              {totalPayout.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">확정 payout 합계</div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">예측 손익</div>
            <div className="mt-3 text-2xl font-black">
              <DeltaText delta={netPredictionResult} />
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">payout - stake</div>
          </div>
        </section>

        <section className="mb-12 rounded-dopameme-xl border-3 border-primary/30 bg-primary/5 p-8 shadow-token-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black text-text-primary">
                다음 행동
              </h2>
              <p className="mt-3 text-base font-semibold text-text-secondary">
                새 마켓에 참여하거나, 출금 지갑과 전체 순위를 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/markets"
                className="rounded-dopameme-pill bg-secondary px-6 py-3 text-center text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark"
              >
                예측 시장
              </Link>
              <Link
                href={`/users/${currentUser.id}`}
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                프로필
              </Link>
              <Link
                href="/feed"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                활동 피드
              </Link>
              <Link
                href="/app/recommendations"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                AI 추천
              </Link>
              <Link
                href="/app/trends"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                트렌드 예측
              </Link>
              <Link
                href="/app/stats"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                통계
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
                href="/app/shop"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                아이템샵
              </Link>
              <Link
                href="/notifications"
                className="rounded-dopameme-pill border-3 border-light-border bg-white px-6 py-3 text-center text-sm font-black text-text-secondary transition hover:border-primary hover:text-primary"
              >
                알림
              </Link>
              <Link
                href="/app/security"
                className="rounded-dopameme-pill border-3 border-light-border bg-white px-6 py-3 text-center text-sm font-black text-text-secondary transition hover:border-primary hover:text-primary"
              >
                보안
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-dopameme-pill border-3 border-secondary bg-white px-6 py-3 text-center text-sm font-black text-secondary transition hover:bg-secondary hover:text-white"
              >
                순위표
              </Link>
              <Link
                href="/app/wallet"
                className="rounded-dopameme-pill border-3 border-light-border bg-white px-6 py-3 text-center text-sm font-black text-text-secondary transition hover:border-primary hover:text-primary"
              >
                출금 지갑
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="flex flex-col gap-3 border-b-3 border-light-border bg-light-bg-alt px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-text-primary">최근 예측</h2>
                <p className="mt-1 text-sm font-semibold text-text-tertiary">
                  최근 8개 참여 내역
                </p>
              </div>
              <Link href="/markets" className="text-sm font-black text-primary hover:text-primary-dark">
                마켓 보기
              </Link>
            </div>

            {recentPredictions.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <h3 className="text-2xl font-black text-text-primary">
                  아직 참여한 예측이 없습니다
                </h3>
                <p className="mt-3 text-base font-semibold text-text-secondary">
                  예측 시장에서 첫 포지션을 만들어보세요.
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-light-border">
                {recentPredictions.map((prediction) => (
                  <Link
                    key={prediction.id}
                    href={`/markets/${prediction.market.id}`}
                    className="grid gap-4 px-5 py-4 transition hover:bg-primary/5 md:grid-cols-[1fr_160px]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${predictionStatusClass(prediction.resolved)}`}
                        >
                          {predictionStatusLabel(prediction)}
                        </span>
                        <span className="text-xs font-bold text-text-tertiary">
                          {formatDate(prediction.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-base font-black text-text-primary">
                        {prediction.market.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-text-secondary">
                        선택: {prediction.option.title}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left md:block md:text-right">
                      <div>
                        <div className="text-xs font-bold text-text-tertiary">참여</div>
                        <div className="mt-1 text-sm font-black text-secondary">
                          -{prediction.amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="md:mt-3">
                        <div className="text-xs font-bold text-text-tertiary">정산</div>
                        <div className="mt-1 text-sm font-black text-success">
                          +{prediction.payout.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">최근 DPMM Ledger</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                최근 10개 잔액 변동
              </p>
            </div>

            {recentLedger.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
                DPMM ledger 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y-2 divide-light-border">
                {recentLedger.map((entry) => {
                  const visibleReason = userLedgerReason(entry.type, entry.reason)

                  return (
                    <div key={entry.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-black text-text-primary">
                            {ledgerTypeLabel(entry.type)}
                          </div>
                          <div className="mt-1 text-xs font-bold text-text-tertiary">
                            {formatDate(entry.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black">
                            <DeltaText delta={entry.delta} />
                          </div>
                          <div className="mt-1 text-xs font-bold text-text-tertiary">
                            잔액 {entry.balanceAfter.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {visibleReason && (
                        <div className="mt-3 rounded-dopameme-md bg-light-bg-alt px-3 py-2 text-xs font-semibold text-text-secondary">
                          {visibleReason}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-40 border-t-2 border-light-border bg-light-bg-alt">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 grid gap-16 md:grid-cols-3">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <span className="text-3xl font-black">
                  <span className="text-primary">도</span>
                  <span className="text-secondary">파</span>
                  <span className="text-primary">밈</span>
                </span>
              </div>
              <p className="text-base font-medium leading-relaxed text-text-secondary">
                게임처럼 즐기는 예측 플랫폼
              </p>
            </div>

            <div>
              <h4 className="mb-6 text-lg font-black text-text-primary">서비스</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/app" className="font-semibold text-text-secondary transition hover:text-primary">내 활동</Link></li>
                <li><Link href="/feed" className="font-semibold text-text-secondary transition hover:text-primary">활동 피드</Link></li>
                <li><Link href="/app/recommendations" className="font-semibold text-text-secondary transition hover:text-primary">AI 추천</Link></li>
                <li><Link href="/app/trends" className="font-semibold text-text-secondary transition hover:text-primary">트렌드 예측</Link></li>
                <li><Link href="/app/stats" className="font-semibold text-text-secondary transition hover:text-primary">통계</Link></li>
                <li><Link href="/app/achievements" className="font-semibold text-text-secondary transition hover:text-primary">업적</Link></li>
                <li><Link href="/app/level" className="font-semibold text-text-secondary transition hover:text-primary">레벨</Link></li>
                <li><Link href="/app/seasons" className="font-semibold text-text-secondary transition hover:text-primary">시즌</Link></li>
                <li><Link href="/app/shop" className="font-semibold text-text-secondary transition hover:text-primary">아이템샵</Link></li>
                <li><Link href="/notifications" className="font-semibold text-text-secondary transition hover:text-primary">알림</Link></li>
                <li><Link href="/app/security" className="font-semibold text-text-secondary transition hover:text-primary">계정 보안</Link></li>
                <li><Link href="/app/wallet" className="font-semibold text-text-secondary transition hover:text-primary">DPMM 출금 지갑</Link></li>
                <li><Link href="/markets" className="font-semibold text-text-secondary transition hover:text-primary">예측 시장</Link></li>
                <li><Link href="/leaderboard" className="font-semibold text-text-secondary transition hover:text-primary">순위표</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-lg font-black text-text-primary">정보</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="font-semibold text-text-secondary transition hover:text-primary">도파밈 소개</Link></li>
                <li><Link href="/terms" className="font-semibold text-text-secondary transition hover:text-primary">이용약관</Link></li>
                <li><Link href="/privacy" className="font-semibold text-text-secondary transition hover:text-primary">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-light-border pt-8 text-center">
            <p className="text-base font-semibold text-text-secondary">
              © 2025 도파밈. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
