import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import { getTrendPredictionOverview } from '@/lib/trend-predictions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatRate(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value).toLocaleString()}%`
}

function formatSignedRate(value: number) {
  if (!Number.isFinite(value)) return '0%'
  const rounded = Math.round(value)
  return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString()}%`
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

function fillClass(tone: Tone) {
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
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

function ScoreBar({
  label,
  value,
  tone = 'primary',
}: {
  label: string
  value: number
  tone?: Tone
}) {
  const normalizedValue = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black text-text-tertiary">
        <span>{label}</span>
        <span>{normalizedValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-dopameme-pill bg-light-bg-alt">
        <div
          className={`h-full rounded-dopameme-pill ${fillClass(tone)}`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  )
}

export default async function TrendsPage() {
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
    getTrendPredictionOverview(),
    getUnreadNotificationCount(currentUser.id),
  ])
  const topCategory = overview.categories[0]
  const averageConfidence = overview.categories.length
    ? Math.round(overview.categories.reduce((sum, category) => sum + category.confidence, 0) / overview.categories.length)
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
              트렌드 예측
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            다음에 뜰 예측 주제
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            최근 7일과 이전 7일의 참여, 댓글, 신규 마켓 신호를 비교합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="상위 카테고리"
            value={overview.categories.length.toLocaleString()}
            helper={topCategory ? `${topCategory.category} ${topCategory.demandLabel}` : '관찰 데이터 없음'}
            tone="primary"
          />
          <StatCard
            label="최근 참여량"
            value={`${overview.totalRecentVolume.toLocaleString()} DPMM`}
            helper={`${overview.totalRecentPredictions.toLocaleString()}개 예측 참여`}
            tone="secondary"
          />
          <StatCard
            label="댓글 신호"
            value={overview.totalRecentComments.toLocaleString()}
            helper="최근 7일 공개 댓글"
            tone="success"
          />
          <StatCard
            label="평균 신뢰도"
            value={`${averageConfidence}%`}
            helper={overview.modelVersion}
            tone="warning"
          />
        </section>

        <section className="mb-12 rounded-dopameme-xl border-3 border-primary/25 bg-primary/5 p-6 shadow-token-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-black text-text-primary">로컬 트렌드 모델</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-text-secondary">
                외부 AI API를 호출하지 않고 현재 DB의 공개 마켓 신호만 사용합니다. 자동 마켓 생성이나 자동 stake는 수행하지 않습니다.
              </p>
            </div>
            <div className="rounded-dopameme-lg border-3 border-light-border bg-white px-5 py-4 text-sm font-black text-text-secondary">
              생성 {formatDateTime(overview.generatedAt)} · {overview.horizonDays}일 전망
            </div>
          </div>
        </section>

        {overview.categories.length === 0 ? (
          <section className="mb-12 rounded-dopameme-xl border-3 border-light-border bg-white p-10 text-center shadow-token-md">
            <h2 className="text-2xl font-black text-text-primary">예측할 공개 신호가 아직 부족합니다</h2>
            <p className="mt-3 text-sm font-semibold text-text-secondary">
              활성 마켓과 사용자 참여가 쌓이면 카테고리별 수요 전망이 표시됩니다.
            </p>
            <Link
              href="/markets"
              className="mt-6 inline-flex rounded-dopameme-pill bg-secondary px-6 py-3 text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark"
            >
              예측 시장 보기
            </Link>
          </section>
        ) : (
          <section className="mb-12 grid gap-5 xl:grid-cols-2">
            {overview.categories.map((category, index) => (
              <article
                key={category.category}
                className={`rounded-dopameme-xl border-3 bg-white p-6 shadow-token-md ${toneClass(category.signalTone)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-dopameme-pill bg-primary px-4 py-1.5 text-xs font-black text-white">
                        #{index + 1}
                      </span>
                      <span className="rounded-dopameme-pill border border-light-border bg-white px-4 py-1.5 text-xs font-black text-text-tertiary">
                        {category.category}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-text-primary">
                      {category.demandLabel} 수요
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-text-secondary">
                      성장률 {formatSignedRate(category.growthRate)} · 신뢰도 {formatRate(category.confidence)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-text-tertiary">Forecast</div>
                    <div className="mt-1 text-4xl font-black text-primary">
                      {category.forecastScore}%
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <ScoreBar label="수요 점수" value={category.forecastScore} tone={category.signalTone} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                    <div className="text-xs font-black text-text-tertiary">최근 참여</div>
                    <div className="mt-2 text-lg font-black text-secondary">
                      {category.recentVolume.toLocaleString()} DPMM
                    </div>
                    <div className="mt-1 text-xs font-bold text-text-secondary">
                      {category.recentPredictions.toLocaleString()}건
                    </div>
                  </div>
                  <div className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                    <div className="text-xs font-black text-text-tertiary">활성 마켓</div>
                    <div className="mt-2 text-lg font-black text-primary">
                      {category.activeMarkets.toLocaleString()}개
                    </div>
                    <div className="mt-1 text-xs font-bold text-text-secondary">
                      신규 {category.newMarkets.toLocaleString()}개
                    </div>
                  </div>
                  <div className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                    <div className="text-xs font-black text-text-tertiary">토론</div>
                    <div className="mt-2 text-lg font-black text-success">
                      {category.recentComments.toLocaleString()}개
                    </div>
                    <div className="mt-1 text-xs font-bold text-text-secondary">
                      이전 {category.previousComments.toLocaleString()}개
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {category.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-dopameme-pill border border-light-border bg-white px-3 py-1 text-xs font-bold text-text-secondary"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mb-12 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-dopameme-xl border-3 border-light-border bg-white p-6 shadow-token-md">
            <h2 className="text-xl font-black text-text-primary">주제 후보</h2>
            <p className="mt-2 text-sm font-semibold text-text-secondary">
              현재 카테고리 신호를 기반으로 운영자가 만들 수 있는 마켓 소재입니다.
            </p>
            <div className="mt-6 space-y-3">
              {overview.topicIdeas.map((topic) => (
                <div key={topic.id} className="rounded-dopameme-lg border-2 border-light-border bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${toneClass(topic.signalTone)}`}>
                      {topic.category}
                    </span>
                    <span className="rounded-dopameme-pill bg-light-bg-alt px-3 py-1 text-xs font-bold text-text-tertiary">
                      {topic.suggestedWindowDays}일
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-black text-text-primary">{topic.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                    {topic.rationale}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ScoreBar label="수요" value={topic.forecastScore} tone={topic.signalTone} />
                    <ScoreBar label="신뢰도" value={topic.confidence} tone="success" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">상승 마켓</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                현재 열려 있고 참여 신호가 빠르게 쌓이는 마켓입니다.
              </p>
            </div>

            {overview.risingMarkets.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
                상승 마켓 신호가 아직 없습니다.
              </div>
            ) : (
              <div className="divide-y-2 divide-light-border">
                {overview.risingMarkets.map((market, index) => (
                  <Link
                    key={market.id}
                    href={`/markets/${market.id}`}
                    className="grid gap-4 px-5 py-4 transition hover:bg-primary/5 md:grid-cols-[1fr_150px]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-dopameme-pill bg-primary px-3 py-1 text-xs font-black text-white">
                          #{index + 1}
                        </span>
                        <span className="rounded-dopameme-pill border border-light-border bg-white px-3 py-1 text-xs font-bold text-text-tertiary">
                          {market.category}
                        </span>
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-base font-black text-text-primary">
                        {market.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-text-secondary">
                        최근 {market.recentPredictions.toLocaleString()}건 · 댓글 {market.recentComments.toLocaleString()}개 · 마감 {formatDateTime(market.endsAt)}
                      </p>
                    </div>
                    <div className="rounded-dopameme-lg border-2 border-light-border bg-white p-4 md:text-right">
                      <div className="text-xs font-black text-text-tertiary">Forecast</div>
                      <div className="mt-1 text-2xl font-black text-primary">
                        {market.forecastScore}%
                      </div>
                      <div className="mt-1 text-xs font-bold text-text-secondary">
                        {formatSignedRate(market.growthRate)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
