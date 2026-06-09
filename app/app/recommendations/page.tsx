import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import { getPredictionRecommendations } from '@/lib/recommendations'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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

function toneClass(tone: Tone) {
  return {
    primary: 'border-primary/25 bg-primary/5 text-primary',
    secondary: 'border-secondary/25 bg-secondary/5 text-secondary',
    success: 'border-success/25 bg-success/5 text-success',
    warning: 'border-warning/25 bg-warning/5 text-warning',
    neutral: 'border-light-border bg-white text-text-primary',
  }[tone]
}

function ScoreBar({
  label,
  value,
  max,
  tone = 'primary',
}: {
  label: string
  value: number
  max: number
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
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black text-text-tertiary">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-dopameme-pill bg-light-bg-alt">
        <div
          className={`h-full rounded-dopameme-pill ${colorClass}`}
          style={{ width: `${Math.min(100, Math.round((value / max) * 100))}%` }}
        />
      </div>
    </div>
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

export default async function RecommendationsPage() {
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
    getPredictionRecommendations(currentUser.id),
    getUnreadNotificationCount(currentUser.id),
  ])
  const topRecommendation = overview.recommendations[0]
  const averageScore = overview.recommendations.length
    ? Math.round(overview.recommendations.reduce((sum, item) => sum + item.score, 0) / overview.recommendations.length)
    : 0

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
              AI 추천
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            {currentUser.name || '도파밈 유저'}님을 위한 예측 추천
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            기존 활동, 시장 momentum, 선택지 확률, 마감 시점을 조합해 추천합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="추천 마켓"
            value={overview.recommendedCount.toLocaleString()}
            helper="이미 참여한 마켓 제외"
            tone="primary"
          />
          <StatCard
            label="평균 적합도"
            value={`${averageScore}%`}
            helper={overview.modelVersion}
            tone="success"
          />
          <StatCard
            label="제외된 마켓"
            value={overview.skippedPredictedMarkets.toLocaleString()}
            helper="이미 예측 참여 완료"
            tone="secondary"
          />
          <StatCard
            label="추천 참여액"
            value={topRecommendation ? `${topRecommendation.suggestedStake.toLocaleString()} DPMM` : '0 DPMM'}
            helper="잔액과 risk 기준"
            tone="warning"
          />
        </section>

        <section className="mb-12 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-dopameme-xl border-3 border-light-border bg-white p-6 shadow-token-md">
            <h2 className="text-xl font-black text-text-primary">내 예측 프로필</h2>
            <p className="mt-2 text-sm font-semibold text-text-secondary">
              추천 모델이 참고하는 상위 카테고리입니다.
            </p>

            {overview.topCategories.length === 0 ? (
              <div className="mt-6 rounded-dopameme-lg border-3 border-dashed border-light-border bg-light-bg-alt px-5 py-8 text-center text-sm font-semibold text-text-secondary">
                예측 이력이 없어 인기/마감/확률 신호 중심으로 추천합니다.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {overview.topCategories.map((category) => (
                  <div key={category.category} className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-black text-text-primary">{category.category}</div>
                        <div className="mt-1 text-xs font-bold text-text-tertiary">
                          {category.predictionCount.toLocaleString()}회 · {category.stakeAmount.toLocaleString()} DPMM
                        </div>
                      </div>
                      <div className="text-sm font-black text-success">
                        {category.winRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-dopameme-xl border-3 border-primary/25 bg-primary/5 p-6 shadow-token-sm">
            <h2 className="text-xl font-black text-text-primary">추천 산식</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-4">
                <div className="text-sm font-black text-primary">Category Fit</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                  기존 참여 카테고리, stake, 정산 승률을 반영합니다.
                </p>
              </div>
              <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-4">
                <div className="text-sm font-black text-secondary">Market Momentum</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                  참여 DPMM, 참여자 수, 댓글 신호를 반영합니다.
                </p>
              </div>
              <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-4">
                <div className="text-sm font-black text-success">Option Confidence</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                  AMM 확률 기준 가장 앞선 선택지를 제안합니다.
                </p>
              </div>
              <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-4">
                <div className="text-sm font-black text-warning">Timing</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                  너무 멀거나 임박한 마켓보다 판단 시간이 남은 마켓을 우선합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {overview.recommendations.length === 0 ? (
          <section className="rounded-dopameme-xl border-3 border-light-border bg-white p-10 text-center shadow-token-md">
            <h2 className="text-2xl font-black text-text-primary">추천 가능한 마켓이 없습니다</h2>
            <p className="mt-3 text-sm font-semibold text-text-secondary">
              이미 모든 활성 마켓에 참여했거나 공개 활성 마켓이 없습니다.
            </p>
            <Link
              href="/markets"
              className="mt-6 inline-flex rounded-dopameme-pill bg-secondary px-6 py-3 text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark"
            >
              예측 시장 보기
            </Link>
          </section>
        ) : (
          <section className="space-y-6">
            {overview.recommendations.map((recommendation, index) => (
              <article
                key={recommendation.marketId}
                className={`overflow-hidden rounded-dopameme-xl border-3 bg-white shadow-token-md ${toneClass(recommendation.signalTone)}`}
              >
                <div className="grid gap-6 p-6 xl:grid-cols-[1fr_280px]">
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-dopameme-pill bg-primary px-4 py-1.5 text-xs font-black text-white">
                        추천 #{index + 1}
                      </span>
                      <span className="rounded-dopameme-pill border border-light-border bg-white px-4 py-1.5 text-xs font-black text-text-tertiary">
                        {recommendation.category}
                      </span>
                      <span className={`rounded-dopameme-pill px-4 py-1.5 text-xs font-black ${
                        recommendation.riskLevel === 'low'
                          ? 'bg-success/10 text-success'
                          : recommendation.riskLevel === 'high'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-primary/10 text-primary'
                      }`}>
                        risk {recommendation.riskLabel}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-text-primary">
                      {recommendation.title}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-text-secondary">
                      {recommendation.description}
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                        <div className="text-xs font-black text-text-tertiary">추천 선택지</div>
                        <div className="mt-2 text-lg font-black text-primary">
                          {recommendation.suggestedOption.title}
                        </div>
                        <div className="mt-1 text-xs font-bold text-text-secondary">
                          {recommendation.suggestedOption.probability}% 확률
                        </div>
                      </div>
                      <div className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                        <div className="text-xs font-black text-text-tertiary">참여량</div>
                        <div className="mt-2 text-lg font-black text-secondary">
                          {recommendation.totalAmount.toLocaleString()} DPMM
                        </div>
                        <div className="mt-1 text-xs font-bold text-text-secondary">
                          {recommendation.participantCount.toLocaleString()}명 참여
                        </div>
                      </div>
                      <div className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                        <div className="text-xs font-black text-text-tertiary">마감</div>
                        <div className="mt-2 text-lg font-black text-text-primary">
                          {formatDate(recommendation.endsAt)}
                        </div>
                        <div className="mt-1 text-xs font-bold text-text-secondary">
                          댓글 {recommendation.commentCount.toLocaleString()}개
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {recommendation.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-dopameme-pill border border-light-border bg-white px-3 py-1 text-xs font-bold text-text-secondary"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5">
                    <div className="text-xs font-black text-text-tertiary">AI 적합도</div>
                    <div className="mt-2 text-5xl font-black text-primary">
                      {recommendation.score}%
                    </div>
                    <div className="mt-5 space-y-3">
                      <ScoreBar label="Category" value={recommendation.scoreBreakdown.category} max={30} tone="primary" />
                      <ScoreBar label="Momentum" value={recommendation.scoreBreakdown.momentum} max={25} tone="secondary" />
                      <ScoreBar label="Confidence" value={recommendation.scoreBreakdown.confidence} max={20} tone="success" />
                      <ScoreBar label="Timing" value={recommendation.scoreBreakdown.timing} max={15} tone="warning" />
                      <ScoreBar label="Novelty" value={recommendation.scoreBreakdown.novelty} max={10} tone="neutral" />
                    </div>

                    <div className="mt-6 rounded-dopameme-md bg-light-bg-alt px-4 py-3">
                      <div className="text-xs font-black text-text-tertiary">추천 참여액</div>
                      <div className="mt-1 text-xl font-black text-secondary">
                        {recommendation.suggestedStake.toLocaleString()} DPMM
                      </div>
                    </div>

                    <Link
                      href={`/markets/${recommendation.marketId}`}
                      className="mt-5 flex w-full items-center justify-center rounded-dopameme-pill bg-secondary px-6 py-3 text-center text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark"
                    >
                      예측하러 가기
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
