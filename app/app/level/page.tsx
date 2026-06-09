import { auth } from '@/auth'
import Header from '@/components/Header'
import { evaluateUserAchievements } from '@/lib/achievements'
import { prisma } from '@/lib/db'
import { evaluateUserLevel } from '@/lib/levels'
import { getUnreadNotificationCount } from '@/lib/notifications'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { claimLevelRewardsAction } from './actions'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
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
    <div className="h-3 overflow-hidden rounded-dopameme-pill bg-light-bg-alt">
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

export default async function LevelPage() {
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

  await evaluateUserAchievements(currentUser.id)

  const [overview, unreadNotificationCount] = await Promise.all([
    evaluateUserLevel(currentUser.id),
    getUnreadNotificationCount(currentUser.id),
  ])

  const nextLevelHelper = overview.nextLevel
    ? `${overview.progressInLevel.toLocaleString()} / ${overview.requiredForNextLevel.toLocaleString()} XP`
    : '최고 레벨 도달'

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
              레벨
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            {currentUser.name || '도파밈 유저'}님의 레벨
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            예측 참여, 적중, 수익, 커뮤니티 활동으로 XP를 획득합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="현재 레벨"
            value={`Lv.${overview.level}`}
            helper={overview.title}
            tone="primary"
          />
          <StatCard
            label="누적 XP"
            value={overview.xp.toLocaleString()}
            helper={`최대 Lv.${overview.maxDefinedLevel}`}
            tone="success"
          />
          <StatCard
            label="다음 레벨"
            value={overview.nextLevel ? `Lv.${overview.nextLevel}` : 'MAX'}
            helper={overview.nextTitle || '최고 등급'}
            tone="secondary"
          />
          <StatCard
            label="수령 가능 보상"
            value={overview.claimableRewardDpmm.toLocaleString()}
            helper={overview.claimableRewardLevels.length
              ? `Lv.${overview.claimableRewardLevels.join(', Lv.')} 보상`
              : '보상 없음'}
            tone="warning"
          />
        </section>

        <section className="mb-12 rounded-dopameme-xl border-3 border-primary/30 bg-primary/5 p-8 shadow-token-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="rounded-dopameme-pill bg-primary px-4 py-2 text-sm font-black text-white">
                  Lv.{overview.level}
                </span>
                <span className="text-sm font-black text-text-tertiary">
                  {overview.title}
                </span>
              </div>
              <h2 className="text-3xl font-black text-text-primary">
                {overview.nextLevel
                  ? `Lv.${overview.nextLevel} ${overview.nextTitle}까지 ${Math.max(0, (overview.nextLevelMinXp || 0) - overview.xp).toLocaleString()} XP`
                  : '최고 레벨에 도달했습니다'}
              </h2>
              <div className="mt-5">
                <ProgressBar value={overview.progressPercent} tone="primary" />
                <div className="mt-2 flex items-center justify-between text-xs font-black text-text-tertiary">
                  <span>{nextLevelHelper}</span>
                  <span>{overview.progressPercent}%</span>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-text-secondary">
                마지막 계산: {formatDate(overview.lastCalculatedAt)}
              </p>
            </div>

            <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm lg:min-w-80">
              <div className="text-sm font-black text-text-tertiary">레벨 보상</div>
              <div className="mt-3 text-3xl font-black text-secondary">
                {overview.claimableRewardDpmm.toLocaleString()} DPMM
              </div>
              <p className="mt-2 text-sm font-semibold text-text-secondary">
                달성했지만 아직 수령하지 않은 레벨 보상입니다.
              </p>
              <form action={claimLevelRewardsAction} className="mt-5">
                <button
                  type="submit"
                  disabled={overview.claimableRewardDpmm <= 0}
                  className="w-full rounded-dopameme-pill bg-secondary px-6 py-3 text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  보상 받기
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mb-12 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">XP 획득 내역</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                현재 계정 활동 기준
              </p>
            </div>
            <div className="divide-y-2 divide-light-border">
              {overview.sources.map((source) => (
                <div key={source.key} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="text-sm font-black text-text-primary">{source.label}</div>
                    <div className="mt-1 text-xs font-bold text-text-tertiary">{source.helper}</div>
                  </div>
                  <div className="shrink-0 text-sm font-black text-primary">
                    +{source.value.toLocaleString()} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">레벨 표</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                XP 기준과 보상
              </p>
            </div>
            <div className="divide-y-2 divide-light-border">
              {overview.definitions.map((definition) => {
                const reached = definition.level <= overview.level
                const rewarded = definition.level <= overview.rewardedLevel

                return (
                  <div
                    key={definition.id}
                    className={`grid gap-3 px-5 py-4 md:grid-cols-[110px_1fr_120px] md:items-center ${
                      reached ? 'bg-success/5' : ''
                    }`}
                  >
                    <div className="text-sm font-black text-primary">Lv.{definition.level}</div>
                    <div>
                      <div className="text-sm font-black text-text-primary">{definition.title}</div>
                      <div className="mt-1 text-xs font-bold text-text-tertiary">
                        {definition.minXp.toLocaleString()} XP 필요
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-sm font-black text-secondary">
                        {definition.rewardDpmm.toLocaleString()} DPMM
                      </div>
                      <div className="mt-1 text-xs font-bold text-text-tertiary">
                        {rewarded ? '수령 완료' : reached ? '수령 가능' : '잠김'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="rounded-dopameme-xl border-3 border-light-border bg-white p-6 shadow-token-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">다음 행동</h2>
              <p className="mt-2 text-sm font-semibold text-text-secondary">
                XP를 더 얻으려면 예측 참여, 업적 달성, 커뮤니티 활동을 늘리면 됩니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app/achievements"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                업적
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
