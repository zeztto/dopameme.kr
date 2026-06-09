import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import { categoryLabel, getEquippedShopItems, profileThemeClass } from '@/lib/shop'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import FollowButton from './FollowButton'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function roleLabel(role: string) {
  if (role === 'admin') return '관리자'
  if (role === 'test') return '테스트'
  return '회원'
}

function roleClass(role: string) {
  if (role === 'admin') return 'border-primary/20 bg-primary/10 text-primary'
  if (role === 'test') return 'border-accent-yellow/20 bg-accent-yellow/10 text-accent-yellow'
  return 'border-light-border bg-light-bg-alt text-text-tertiary'
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

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [profileUser, currentUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        dpmmBalance: true,
        createdAt: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dpmmBalance: true, status: true },
    }),
  ])

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  if (!profileUser || profileUser.status !== 'active' || profileUser.role === 'system') {
    notFound()
  }

  const leaderboardWhere = {
    status: 'active',
    role: { not: 'system' },
  }

  const [
    totalPredictionCount,
    activePredictionCount,
    winCount,
    lossCount,
    predictionVolume,
    payoutTotal,
    commentCount,
    followerCount,
    followingCount,
    isFollowing,
    unreadNotificationCount,
    recentPredictions,
    recentComments,
    totalUsers,
    higherRankedUsers,
    equippedShopItems,
  ] = await Promise.all([
    prisma.prediction.count({
      where: {
        userId: profileUser.id,
        market: { hidden: false },
      },
    }),
    prisma.prediction.count({
      where: {
        userId: profileUser.id,
        market: { status: 'active', hidden: false },
      },
    }),
    prisma.prediction.count({
      where: {
        userId: profileUser.id,
        resolved: 1,
        market: { hidden: false },
      },
    }),
    prisma.prediction.count({
      where: {
        userId: profileUser.id,
        resolved: -1,
        market: { hidden: false },
      },
    }),
    prisma.prediction.aggregate({
      where: {
        userId: profileUser.id,
        market: { hidden: false },
      },
      _sum: { amount: true },
    }),
    prisma.prediction.aggregate({
      where: {
        userId: profileUser.id,
        market: { hidden: false },
      },
      _sum: { payout: true },
    }),
    prisma.marketComment.count({
      where: {
        userId: profileUser.id,
        status: 'visible',
        market: { hidden: false },
      },
    }),
    prisma.userFollow.count({
      where: { followingId: profileUser.id },
    }),
    prisma.userFollow.count({
      where: { followerId: profileUser.id },
    }),
    prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: profileUser.id,
        },
      },
      select: { id: true },
    }),
    getUnreadNotificationCount(session.user.id),
    prisma.prediction.findMany({
      where: {
        userId: profileUser.id,
        market: { hidden: false },
      },
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
    prisma.marketComment.findMany({
      where: {
        userId: profileUser.id,
        status: 'visible',
        market: { hidden: false },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        market: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.user.count({ where: leaderboardWhere }),
    prisma.user.count({
      where: {
        ...leaderboardWhere,
        OR: [
          { dpmmBalance: { gt: profileUser.dpmmBalance } },
          {
            dpmmBalance: profileUser.dpmmBalance,
            createdAt: { lt: profileUser.createdAt },
          },
          {
            dpmmBalance: profileUser.dpmmBalance,
            createdAt: profileUser.createdAt,
            id: { lt: profileUser.id },
          },
        ],
      },
    }),
    getEquippedShopItems(profileUser.id),
  ])

  const displayName = profileUser.name || '도파밈 유저'
  const rank = higherRankedUsers + 1
  const winRate = winCount + lossCount > 0
    ? Math.round((winCount / (winCount + lossCount)) * 100)
    : 0
  const totalStaked = predictionVolume._sum.amount || 0
  const totalPayout = payoutTotal._sum.payout || 0
  const netPredictionResult = totalPayout - totalStaked
  const isOwnProfile = profileUser.id === session.user.id
  const equippedTheme = equippedShopItems.find((ownedItem) => ownedItem.item.category === 'profile_theme')
  const equippedBadge = equippedShopItems.find((ownedItem) => ownedItem.item.category === 'badge')
  const equippedEmote = equippedShopItems.find((ownedItem) => ownedItem.item.category === 'emote')

  return (
    <div className="min-h-screen bg-white">
      <Header
        isAuthenticated={true}
        userBalance={currentUser.dpmmBalance}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-20">
        <section className={`mb-12 rounded-dopameme-xl border-3 p-8 shadow-token-sm ${profileThemeClass(equippedTheme?.item.code)}`}>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className={`rounded-dopameme-pill border px-4 py-2 text-sm font-black ${roleClass(profileUser.role)}`}>
                  {roleLabel(profileUser.role)}
                </span>
                <span className="rounded-dopameme-pill border border-light-border bg-white px-4 py-2 text-sm font-black text-text-tertiary">
                  가입 {formatDate(profileUser.createdAt)}
                </span>
                {equippedBadge && (
                  <span className="rounded-dopameme-pill border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-black text-secondary">
                    {equippedBadge.item.previewText}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl font-black text-text-primary">
                  {displayName}
                </h1>
                {equippedEmote && (
                  <span className="rounded-dopameme-pill border-3 border-success/30 bg-white px-5 py-2 text-lg font-black text-success">
                    {equippedEmote.item.previewText}
                  </span>
                )}
              </div>
              <p className="mt-4 max-w-2xl text-lg font-semibold text-text-secondary">
                예측 참여, 랭킹, 공개 댓글 활동을 확인할 수 있는 사용자 프로필입니다.
              </p>
              {equippedShopItems.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {equippedShopItems.map((ownedItem) => (
                    <span
                      key={ownedItem.id}
                      className="rounded-dopameme-pill border border-light-border bg-white px-3 py-1 text-xs font-black text-text-tertiary"
                    >
                      {categoryLabel(ownedItem.item.category)}: {ownedItem.item.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 lg:min-w-80">
              <div className="rounded-dopameme-lg border-3 border-primary bg-white p-6 text-left shadow-token-brand">
                <div className="text-sm font-black text-text-tertiary">현재 랭킹</div>
                <div className="mt-3 text-4xl font-black text-primary">
                  {rank.toLocaleString()}위
                </div>
                <div className="mt-2 text-sm font-bold text-text-secondary">
                  전체 {totalUsers.toLocaleString()}명 중
                </div>
              </div>

              {!isOwnProfile && (
                <FollowButton
                  userId={profileUser.id}
                  initialFollowing={Boolean(isFollowing)}
                />
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">팔로워</div>
            <div className="mt-3 text-3xl font-black text-primary">
              {followerCount.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              이 사용자를 팔로우하는 회원
            </div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">팔로잉</div>
            <div className="mt-3 text-3xl font-black text-secondary">
              {followingCount.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              이 사용자가 팔로우하는 회원
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="보유 DPMM"
            value={profileUser.dpmmBalance.toLocaleString()}
            helper="장부 기준 공개 잔액"
            tone="primary"
          />
          <StatCard
            label="전체 예측"
            value={totalPredictionCount.toLocaleString()}
            helper={`${activePredictionCount.toLocaleString()}개 진행 중`}
            tone="success"
          />
          <StatCard
            label="승률"
            value={`${winRate}%`}
            helper={`${winCount.toLocaleString()}승 ${lossCount.toLocaleString()}패`}
            tone="secondary"
          />
          <StatCard
            label="댓글"
            value={commentCount.toLocaleString()}
            helper="공개 마켓 토론 기준"
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

        <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="flex flex-col gap-3 border-b-3 border-light-border bg-light-bg-alt px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-text-primary">최근 예측</h2>
                <p className="mt-1 text-sm font-semibold text-text-tertiary">
                  공개 마켓 기준 최근 8개 참여
                </p>
              </div>
              <Link href="/markets" className="text-sm font-black text-primary hover:text-primary-dark">
                마켓 보기
              </Link>
            </div>

            {recentPredictions.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <h3 className="text-2xl font-black text-text-primary">
                  공개 예측 기록이 없습니다
                </h3>
                <p className="mt-3 text-base font-semibold text-text-secondary">
                  공개 마켓에 참여하면 이곳에 표시됩니다.
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
                          {formatShortDate(prediction.createdAt)}
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
              <h2 className="text-xl font-black text-text-primary">최근 댓글</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                공개 마켓 토론 기준 최근 6개
              </p>
            </div>

            {recentComments.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm font-semibold text-text-secondary">
                공개 댓글 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y-2 divide-light-border">
                {recentComments.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/markets/${comment.market.id}`}
                    className="block px-5 py-4 transition hover:bg-primary/5"
                  >
                    <div className="text-xs font-bold text-text-tertiary">
                      {formatShortDate(comment.createdAt)}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-black text-text-primary">
                      {comment.market.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-text-secondary">
                      {comment.content}
                    </p>
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
