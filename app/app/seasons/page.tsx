import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import { getSeasonEventsOverview } from '@/lib/seasons'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

function seasonTypeLabel(type: string) {
  if (type === 'monthly') return '월간'
  if (type === 'quarterly') return '분기'
  return type
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
    <div className={`rounded-dopameme-lg border-3 p-5 shadow-token-sm ${toneClass(tone)}`}>
      <div className="text-sm font-black text-text-tertiary">{label}</div>
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

export default async function SeasonsPage() {
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
    },
  })

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  const [overview, unreadNotificationCount] = await Promise.all([
    getSeasonEventsOverview(currentUser.id),
    getUnreadNotificationCount(currentUser.id),
  ])

  const primarySeason = overview.activeSeasons[0]
  const totalScore = overview.activeSeasons.reduce((sum, season) => sum + season.myProgress.score, 0)
  const bestRank = overview.activeSeasons.reduce<number | null>((best, season) => {
    if (!season.myRank) return best
    return best === null ? season.myRank : Math.min(best, season.myRank)
  }, null)

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
              시즌
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            시즌 챔피언십
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            월간/분기별 예측 성과와 커뮤니티 활동으로 leaderboard를 겨룹니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="진행 중 시즌"
            value={overview.activeSeasons.length.toLocaleString()}
            helper={primarySeason ? `${formatDate(primarySeason.startsAt)} - ${formatDate(primarySeason.endsAt)}` : '활성 시즌 없음'}
            tone="primary"
          />
          <StatCard
            label="내 시즌 점수"
            value={totalScore.toLocaleString()}
            helper="활성 시즌 합산"
            tone="success"
          />
          <StatCard
            label="최고 순위"
            value={bestRank ? `${bestRank.toLocaleString()}위` : '-'}
            helper="활성 시즌 중 가장 높은 순위"
            tone="secondary"
          />
          <StatCard
            label="보상 pool"
            value={overview.activeSeasons.reduce((sum, season) => sum + season.rewardDpmm, 0).toLocaleString()}
            helper="시즌별 metadata 기준"
            tone="warning"
          />
        </section>

        {overview.activeSeasons.length === 0 ? (
          <section className="rounded-dopameme-xl border-3 border-light-border bg-white p-10 text-center shadow-token-md">
            <h2 className="text-2xl font-black text-text-primary">진행 중인 시즌이 없습니다</h2>
            <p className="mt-3 text-sm font-semibold text-text-secondary">
              다음 시즌이 열리면 이 화면에서 leaderboard를 확인할 수 있습니다.
            </p>
          </section>
        ) : (
          <div className="space-y-12">
            {overview.activeSeasons.map((season) => (
              <section key={season.id} className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
                <div className="border-b-3 border-light-border bg-light-bg-alt px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                          season.type === 'monthly'
                            ? 'bg-primary text-white'
                            : 'bg-secondary text-white'
                        }`}>
                          {seasonTypeLabel(season.type)}
                        </span>
                        <span className="text-xs font-bold text-text-tertiary">
                          {formatDate(season.startsAt)} - {formatDate(season.endsAt)}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black text-text-primary">{season.title}</h2>
                      <p className="mt-2 text-sm font-semibold text-text-secondary">
                        {season.description}
                      </p>
                    </div>
                    <div className="rounded-dopameme-lg border-3 border-primary/25 bg-primary/5 px-5 py-4 text-left lg:text-right">
                      <div className="text-xs font-black text-text-tertiary">내 순위</div>
                      <div className="mt-1 text-2xl font-black text-primary">
                        {season.myRank ? `${season.myRank.toLocaleString()}위` : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 xl:grid-cols-[0.85fr_1.15fr]">
                  <div className="space-y-4">
                    <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5">
                      <h3 className="text-xl font-black text-text-primary">내 시즌 기록</h3>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <StatCard
                          label="점수"
                          value={season.myProgress.score.toLocaleString()}
                          helper={`보상 pool ${season.rewardDpmm.toLocaleString()} DPMM`}
                          tone="primary"
                        />
                        <StatCard
                          label="예측"
                          value={season.myProgress.predictionCount.toLocaleString()}
                          helper={`${season.myProgress.winCount.toLocaleString()}개 적중`}
                          tone="success"
                        />
                        <StatCard
                          label="참여량"
                          value={season.myProgress.stakeAmount.toLocaleString()}
                          helper="시즌 내 stake"
                          tone="secondary"
                        />
                        <StatCard
                          label="토론"
                          value={season.myProgress.commentCount.toLocaleString()}
                          helper={`수익 ${season.myProgress.profitAmount.toLocaleString()} DPMM`}
                          tone="warning"
                        />
                      </div>
                      <p className="mt-4 text-xs font-bold text-text-tertiary">
                        마지막 계산: {formatDateTime(season.myProgress.lastCalculatedAt)}
                      </p>
                    </div>

                    <div className="rounded-dopameme-lg border-3 border-primary/25 bg-primary/5 p-5">
                      <h3 className="text-xl font-black text-text-primary">점수 규칙</h3>
                      <ul className="mt-4 space-y-2 text-sm font-semibold text-text-secondary">
                        <li>예측 1회: 100점</li>
                        <li>적중 1회: 300점</li>
                        <li>참여량 100 DPMM: 1점</li>
                        <li>양수 수익 50 DPMM: 1점</li>
                        <li>댓글 1개: 75점</li>
                      </ul>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white">
                    <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
                      <h3 className="text-xl font-black text-text-primary">Leaderboard Top 10</h3>
                      <p className="mt-1 text-sm font-semibold text-text-tertiary">
                        점수 기준 내림차순
                      </p>
                    </div>

                    {season.leaderboard.length === 0 ? (
                      <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
                        아직 시즌 참여자가 없습니다.
                      </div>
                    ) : (
                      <div className="divide-y-2 divide-light-border">
                        {season.leaderboard.map((row) => (
                          <div
                            key={row.userId}
                            className={`grid gap-4 px-5 py-4 md:grid-cols-[64px_1fr_130px] md:items-center ${
                              row.isCurrentUser ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="text-2xl font-black text-primary">
                              #{row.rank}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/users/${row.userId}`}
                                className="text-base font-black text-text-primary transition hover:text-primary"
                              >
                                {row.name}
                              </Link>
                              <div className="mt-1 text-xs font-bold text-text-tertiary">
                                예측 {row.predictionCount.toLocaleString()} · 적중 {row.winCount.toLocaleString()} · 댓글 {row.commentCount.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-left md:text-right">
                              <div className="text-lg font-black text-secondary">
                                {row.score.toLocaleString()}
                              </div>
                              <div className="mt-1 text-xs font-bold text-text-tertiary">
                                points
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        <section className="mt-12 rounded-dopameme-xl border-3 border-light-border bg-white p-6 shadow-token-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">다음 행동</h2>
              <p className="mt-2 text-sm font-semibold text-text-secondary">
                시즌 점수는 예측 참여, 적중, 토론 활동으로 올라갑니다.
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
                href="/app/level"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                레벨
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
