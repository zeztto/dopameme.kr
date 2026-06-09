import { auth } from '@/auth'
import Header from '@/components/Header'
import { evaluateUserAchievements } from '@/lib/achievements'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

function formatDate(date: Date | null) {
  if (!date) return null

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function categoryLabel(category: string) {
  if (category === 'prediction') return '예측'
  if (category === 'accuracy') return '적중'
  if (category === 'profit') return '수익'
  if (category === 'volume') return '참여량'
  if (category === 'community') return '커뮤니티'
  return category
}

function categoryTone(category: string): Tone {
  if (category === 'prediction') return 'primary'
  if (category === 'accuracy') return 'success'
  if (category === 'profit') return 'secondary'
  if (category === 'volume') return 'warning'
  return 'neutral'
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

function ProgressBar({
  value,
  tone = 'primary',
}: {
  value: number
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
    <div className="h-2 overflow-hidden rounded-dopameme-pill bg-light-bg-alt">
      <div
        className={`h-full rounded-dopameme-pill ${colorClass}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
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
    <div className={`rounded-dopameme-lg border-3 p-6 shadow-token-sm ${toneClass(tone)}`}>
      <div className="text-sm font-black text-text-tertiary">{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

export default async function AchievementsPage() {
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
    evaluateUserAchievements(currentUser.id),
    getUnreadNotificationCount(currentUser.id),
  ])

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
              업적
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            {currentUser.name || '도파밈 유저'}님의 업적
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            예측 참여, 적중, 수익, 커뮤니티 활동을 기준으로 자동 집계합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="달성 업적"
            value={`${overview.unlockedCount.toLocaleString()}/${overview.totalCount.toLocaleString()}`}
            helper="활성 업적 기준"
            tone="primary"
          />
          <StatCard
            label="완료율"
            value={`${overview.completionRate}%`}
            helper="전체 업적 진행률"
            tone="success"
          />
          <StatCard
            label="다음 목표"
            value={overview.nextAchievements.length.toLocaleString()}
            helper="완료에 가까운 미달성 업적"
            tone="secondary"
          />
          <StatCard
            label="카테고리"
            value={overview.categories.length.toLocaleString()}
            helper="예측, 적중, 수익, 커뮤니티"
            tone="warning"
          />
        </section>

        <section className="mb-12 rounded-dopameme-xl border-3 border-light-border bg-white p-6 shadow-token-md">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-text-primary">카테고리 진행률</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                카테고리별 완료 수
              </p>
            </div>
            <Link href="/app/stats" className="text-sm font-black text-primary hover:text-primary-dark">
              통계 보기
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {overview.categories.map((category) => {
              const tone = categoryTone(category.category)
              const percent = category.totalCount > 0
                ? Math.round((category.unlockedCount / category.totalCount) * 100)
                : 0

              return (
                <div key={category.category} className="rounded-dopameme-md border-2 border-light-border bg-light-bg-alt p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black text-text-primary">
                      {categoryLabel(category.category)}
                    </div>
                    <div className="text-xs font-black text-text-tertiary">
                      {category.unlockedCount}/{category.totalCount}
                    </div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={percent} tone={tone} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {overview.nextAchievements.length > 0 && (
          <section className="mb-12 rounded-dopameme-xl border-3 border-primary/30 bg-primary/5 p-6 shadow-token-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-text-primary">다음에 달성할 업적</h2>
              <p className="mt-1 text-sm font-semibold text-text-secondary">
                현재 진행률이 가장 높은 미달성 업적입니다.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {overview.nextAchievements.map((achievement) => {
                const tone = categoryTone(achievement.category)

                return (
                  <div key={achievement.id} className="rounded-dopameme-lg border-3 border-primary/20 bg-white p-5 shadow-token-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${toneClass(tone)}`}>
                          {categoryLabel(achievement.category)}
                        </span>
                        <h3 className="mt-4 text-xl font-black text-text-primary">
                          {achievement.title}
                        </h3>
                      </div>
                      <div className="rounded-dopameme-md bg-light-bg-alt px-3 py-2 text-sm font-black text-primary">
                        {achievement.icon}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-text-secondary">
                      {achievement.description}
                    </p>
                    <div className="mt-5">
                      <ProgressBar value={achievement.progressPercent} tone={tone} />
                      <div className="mt-2 flex items-center justify-between text-xs font-black text-text-tertiary">
                        <span>{achievement.progress.toLocaleString()}</span>
                        <span>{achievement.threshold.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overview.achievements.map((achievement) => {
            const tone = categoryTone(achievement.category)
            const unlockedDate = formatDate(achievement.unlockedAt)

            return (
              <article
                key={achievement.id}
                className={`rounded-dopameme-xl border-3 p-5 shadow-token-sm ${
                  achievement.unlockedAt
                    ? 'border-success/30 bg-success/5'
                    : 'border-light-border bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${toneClass(tone)}`}>
                      {categoryLabel(achievement.category)}
                    </span>
                    <h2 className="mt-4 text-xl font-black text-text-primary">
                      {achievement.title}
                    </h2>
                  </div>
                  <div className={`shrink-0 rounded-dopameme-md px-3 py-2 text-sm font-black ${toneClass(tone)}`}>
                    {achievement.icon}
                  </div>
                </div>

                <p className="mt-3 min-h-11 text-sm font-semibold leading-relaxed text-text-secondary">
                  {achievement.description}
                </p>

                <div className="mt-5">
                  <ProgressBar value={achievement.progressPercent} tone={achievement.unlockedAt ? 'success' : tone} />
                  <div className="mt-2 flex items-center justify-between text-xs font-black text-text-tertiary">
                    <span>{achievement.progress.toLocaleString()}</span>
                    <span>{achievement.threshold.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-light-border pt-4">
                  <span
                    className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                      achievement.unlockedAt
                        ? 'bg-success text-white'
                        : 'bg-light-bg-alt text-text-tertiary'
                    }`}
                  >
                    {achievement.unlockedAt ? '달성 완료' : '진행 중'}
                  </span>
                  <span className="text-xs font-bold text-text-tertiary">
                    {unlockedDate || `${achievement.progressPercent}%`}
                  </span>
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
