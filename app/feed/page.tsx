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

function displayName(user: { name: string | null }) {
  return user.name || '도파밈 유저'
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

type PredictionEvent = {
  id: string
  type: 'prediction'
  createdAt: Date
  user: {
    id: string
    name: string | null
  }
  market: {
    id: string
    title: string
    status: string
    endsAt: Date
  }
  optionTitle: string
  amount: number
  payout: number
  resolved: number
}

type CommentEvent = {
  id: string
  type: 'comment'
  createdAt: Date
  user: {
    id: string
    name: string | null
  }
  market: {
    id: string
    title: string
  }
  content: string
}

type FeedEvent = PredictionEvent | CommentEvent

function PredictionFeedItem({ event }: { event: PredictionEvent }) {
  return (
    <div className="border-b-2 border-light-border px-5 py-5 transition last:border-b-0 hover:bg-primary/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-dopameme-pill bg-primary px-3 py-1 text-xs font-black text-white">
              예측
            </span>
            <span
              className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${predictionStatusClass(event.resolved)}`}
            >
              {predictionStatusLabel(event)}
            </span>
            <span className="text-xs font-bold text-text-tertiary">
              {formatDate(event.createdAt)}
            </span>
          </div>

          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
            <Link
              href={`/users/${event.user.id}`}
              className="font-black text-text-primary transition hover:text-primary"
            >
              {displayName(event.user)}
            </Link>
            <span className="text-sm font-semibold text-text-secondary">
              님이 예측에 참여했습니다
            </span>
          </div>

          <Link
            href={`/markets/${event.market.id}`}
            className="mt-2 block line-clamp-2 text-lg font-black text-text-primary transition hover:text-primary"
          >
            {event.market.title}
          </Link>
          <p className="mt-1 text-sm font-semibold text-text-secondary">
            선택: {event.optionTitle}
          </p>
        </div>

        <div className="grid min-w-44 grid-cols-2 gap-3 text-left md:text-right">
          <div>
            <div className="text-xs font-bold text-text-tertiary">참여</div>
            <div className="mt-1 text-sm font-black text-secondary">
              -{event.amount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-text-tertiary">정산</div>
            <div className="mt-1 text-sm font-black text-success">
              +{event.payout.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentFeedItem({ event }: { event: CommentEvent }) {
  return (
    <div className="border-b-2 border-light-border px-5 py-5 transition last:border-b-0 hover:bg-primary/5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-dopameme-pill bg-secondary px-3 py-1 text-xs font-black text-white">
          댓글
        </span>
        <span className="text-xs font-bold text-text-tertiary">
          {formatDate(event.createdAt)}
        </span>
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
        <Link
          href={`/users/${event.user.id}`}
          className="font-black text-text-primary transition hover:text-primary"
        >
          {displayName(event.user)}
        </Link>
        <span className="text-sm font-semibold text-text-secondary">
          님이 마켓 토론에 참여했습니다
        </span>
      </div>

      <Link
        href={`/markets/${event.market.id}`}
        className="mt-2 block line-clamp-2 text-lg font-black text-text-primary transition hover:text-primary"
      >
        {event.market.title}
      </Link>
      <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words rounded-dopameme-md bg-light-bg-alt px-4 py-3 text-sm font-semibold leading-6 text-text-secondary">
        {event.content}
      </p>
    </div>
  )
}

export default async function FeedPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      status: true,
      dpmmBalance: true,
    },
  })

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  const [followRows, unreadNotificationCount] = await Promise.all([
    prisma.userFollow.findMany({
      where: {
        followerId: currentUser.id,
        following: {
          status: 'active',
          role: { not: 'system' },
        },
      },
      take: 500,
      orderBy: { createdAt: 'desc' },
      select: {
        followingId: true,
      },
    }),
    getUnreadNotificationCount(currentUser.id),
  ])

  const followingIds = followRows.map((row) => row.followingId)
  const [recentPredictions, recentComments] = followingIds.length > 0
    ? await Promise.all([
      prisma.prediction.findMany({
        where: {
          userId: { in: followingIds },
          market: { hidden: false },
        },
        take: 30,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          payout: true,
          resolved: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
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
          userId: { in: followingIds },
          status: 'visible',
          market: { hidden: false },
        },
        take: 30,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          market: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ])
    : [[], []]

  const feedEvents: FeedEvent[] = [
    ...recentPredictions.map((prediction): PredictionEvent => ({
      id: prediction.id,
      type: 'prediction',
      createdAt: prediction.createdAt,
      user: prediction.user,
      market: prediction.market,
      optionTitle: prediction.option.title,
      amount: prediction.amount,
      payout: prediction.payout,
      resolved: prediction.resolved,
    })),
    ...recentComments.map((comment): CommentEvent => ({
      id: comment.id,
      type: 'comment',
      createdAt: comment.createdAt,
      user: comment.user,
      market: comment.market,
      content: comment.content,
    })),
  ]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 30)

  return (
    <div className="min-h-screen bg-white">
      <Header
        userBalance={currentUser.dpmmBalance}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-20">
        <section className="mb-12 text-center">
          <div className="mb-6 inline-block">
            <span className="rounded-dopameme-pill bg-secondary px-8 py-3 text-sm font-black text-white shadow-token-md">
              활동 피드
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            팔로우한 회원들의 공개 활동
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            예측 참여와 마켓 토론 흐름을 한 화면에서 확인합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-dopameme-lg border-3 border-primary/25 bg-primary/5 p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">팔로잉</div>
            <div className="mt-3 text-3xl font-black text-primary">
              {followingIds.length.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              피드 기준 회원
            </div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-success/25 bg-success/5 p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">예측 활동</div>
            <div className="mt-3 text-3xl font-black text-success">
              {recentPredictions.length.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              최근 공개 예측
            </div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-secondary/25 bg-secondary/5 p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">댓글 활동</div>
            <div className="mt-3 text-3xl font-black text-secondary">
              {recentComments.length.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              최근 공개 토론
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
          <div className="flex flex-col gap-3 border-b-3 border-light-border bg-light-bg-alt px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">최근 활동</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                팔로우한 회원의 공개 예측과 visible 댓글 기준
              </p>
            </div>
            <Link href="/leaderboard" className="text-sm font-black text-primary hover:text-primary-dark">
              팔로우할 회원 찾기
            </Link>
          </div>

          {followingIds.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <h3 className="text-2xl font-black text-text-primary">
                아직 팔로우한 회원이 없습니다
              </h3>
              <p className="mt-3 text-base font-semibold text-text-secondary">
                순위표나 사용자 프로필에서 팔로우를 시작하면 피드가 채워집니다.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/leaderboard"
                  className="rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white shadow-token-brand transition hover:bg-primary-dark"
                >
                  순위표 보기
                </Link>
                <Link
                  href="/markets"
                  className="rounded-dopameme-pill border-3 border-secondary bg-white px-6 py-3 text-sm font-black text-secondary transition hover:bg-secondary hover:text-white"
                >
                  마켓 보기
                </Link>
              </div>
            </div>
          ) : feedEvents.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <h3 className="text-2xl font-black text-text-primary">
                최근 공개 활동이 없습니다
              </h3>
              <p className="mt-3 text-base font-semibold text-text-secondary">
                팔로우한 회원이 공개 마켓에 참여하거나 댓글을 남기면 표시됩니다.
              </p>
            </div>
          ) : (
            <div>
              {feedEvents.map((event) => (
                event.type === 'prediction'
                  ? <PredictionFeedItem key={`prediction-${event.id}`} event={event} />
                  : <CommentFeedItem key={`comment-${event.id}`} event={event} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
