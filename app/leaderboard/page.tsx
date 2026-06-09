import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type RankedUser = {
  id: string
  name: string | null
  role: string
  dpmmBalance: number
  createdAt: Date
}

function displayName(user: Pick<RankedUser, 'name'>) {
  return user.name || '도파밈 유저'
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

function rankLabel(rank: number) {
  if (rank === 1) return '1위'
  if (rank === 2) return '2위'
  if (rank === 3) return '3위'
  return rank.toLocaleString()
}

function rankClass(rank: number, isCurrentUser: boolean) {
  if (isCurrentUser) return 'bg-primary text-white shadow-token-brand'
  if (rank === 1) return 'bg-accent-yellow text-white shadow-token-md'
  if (rank === 2) return 'bg-text-tertiary text-white shadow-token-md'
  if (rank === 3) return 'bg-secondary text-white shadow-token-md'
  return 'bg-light-bg-alt text-text-secondary'
}

function LeaderboardRow({
  user,
  rank,
  isCurrentUser,
}: {
  user: RankedUser
  rank: number
  isCurrentUser: boolean
}) {
  return (
    <div
      className={`grid gap-4 border-b-2 border-light-border px-5 py-4 last:border-b-0 md:grid-cols-[88px_1fr_130px_180px] md:items-center ${
        isCurrentUser ? 'bg-primary/5' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-11 min-w-11 items-center justify-center rounded-dopameme-pill px-3 text-sm font-black ${rankClass(rank, isCurrentUser)}`}
        >
          {rankLabel(rank)}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Link href={`/users/${user.id}`} className="truncate text-base font-black text-text-primary transition hover:text-primary">
            {displayName(user)}
          </Link>
          {isCurrentUser && (
            <span className="rounded-dopameme-pill bg-primary px-3 py-1 text-xs font-black text-white">
              내 순위
            </span>
          )}
        </div>
        <div className="mt-1 text-xs font-bold text-text-tertiary">
          가입 {user.createdAt.toLocaleDateString('ko-KR')}
        </div>
      </div>

      <div>
        <span
          className={`inline-flex rounded-dopameme-pill border px-3 py-1 text-xs font-black ${roleClass(user.role)}`}
        >
          {roleLabel(user.role)}
        </span>
      </div>

      <div className="text-left md:text-right">
        <span className="text-xl font-black text-primary">
          {user.dpmmBalance.toLocaleString()}
        </span>
        <span className="ml-1 text-xs font-black text-text-tertiary">DPMM</span>
      </div>
    </div>
  )
}

export default async function LeaderboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      status: true,
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
    topUsers,
    totalUsers,
    totalBalance,
    higherRankedUsers,
    unreadNotificationCount,
  ] = await Promise.all([
    prisma.user.findMany({
      where: leaderboardWhere,
      take: 100,
      orderBy: [
        { dpmmBalance: 'desc' },
        { createdAt: 'asc' },
        { id: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        role: true,
        dpmmBalance: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: leaderboardWhere }),
    prisma.user.aggregate({
      where: leaderboardWhere,
      _sum: { dpmmBalance: true },
    }),
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
    getUnreadNotificationCount(currentUser.id),
  ])

  const myRank = higherRankedUsers + 1
  const currentUserInTop = topUsers.some((user) => user.id === currentUser.id)
  const averageBalance = totalUsers > 0
    ? Math.round((totalBalance._sum.dpmmBalance || 0) / totalUsers)
    : 0

  return (
    <div className="min-h-screen bg-white">
      <Header
        userBalance={currentUser.dpmmBalance}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-20">
        <section className="mb-12 text-center">
          <div className="inline-block mb-6">
            <span className="rounded-dopameme-pill bg-primary px-8 py-3 text-sm font-black text-white shadow-token-brand">
              순위표
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            예측 고수들과 경쟁하세요
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            DPMM 잔액 기준 Top 100 사용자와 내 순위를 확인합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-dopameme-lg border-3 border-primary/25 bg-primary/5 p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">내 순위</div>
            <div className="mt-3 text-3xl font-black text-primary">
              {myRank.toLocaleString()}위
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              전체 {totalUsers.toLocaleString()}명 중
            </div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-success/25 bg-success/5 p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">내 DPMM</div>
            <div className="mt-3 text-3xl font-black text-success">
              {currentUser.dpmmBalance.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              장부 기준 현재 잔액
            </div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-secondary/25 bg-secondary/5 p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">평균 DPMM</div>
            <div className="mt-3 text-3xl font-black text-secondary">
              {averageBalance.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              활성 회원 평균 잔액
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
          <div className="grid gap-4 border-b-3 border-light-border bg-light-bg-alt px-5 py-4 text-xs font-black uppercase tracking-wide text-text-tertiary md:grid-cols-[88px_1fr_130px_180px]">
            <div>순위</div>
            <div>닉네임</div>
            <div>역할</div>
            <div className="md:text-right">DPMM 잔액</div>
          </div>

          {topUsers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <h2 className="text-2xl font-black text-text-primary">
                아직 순위 데이터가 없습니다
              </h2>
              <p className="mt-3 text-base font-semibold text-text-secondary">
                예측에 참여하면 이곳에 DPMM 순위가 표시됩니다.
              </p>
            </div>
          ) : (
            topUsers.map((user, index) => (
              <LeaderboardRow
                key={user.id}
                user={user}
                rank={index + 1}
                isCurrentUser={user.id === currentUser.id}
              />
            ))
          )}
        </section>

        {!currentUserInTop && (
          <section className="mt-8 overflow-hidden rounded-dopameme-xl border-3 border-primary/30 bg-white shadow-token-sm">
            <div className="border-b-2 border-primary/20 bg-primary/5 px-5 py-4">
              <h2 className="text-lg font-black text-text-primary">내 순위</h2>
            </div>
            <LeaderboardRow user={currentUser} rank={myRank} isCurrentUser />
          </section>
        )}

        <section className="mt-10 flex flex-col gap-3 rounded-dopameme-lg border-3 border-light-border bg-light-bg-alt p-5 text-sm font-bold text-text-secondary md:flex-row md:items-center md:justify-between">
          <div>
            관리자와 테스트 계정은 역할 배지로 구분되며, 시스템 계정과 정지 회원은 순위에서 제외됩니다.
          </div>
          <Link href="/markets" className="font-black text-primary hover:text-primary-dark">
            예측 시장 보기
          </Link>
        </section>
      </main>
    </div>
  )
}
