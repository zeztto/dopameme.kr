import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import AdminUserActions from './AdminUserActions'

export const dynamic = 'force-dynamic'

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string
    role?: string
    status?: string
    auth?: string
    page?: string
  }>
}

const pageSize = 25

const roleOptions = [
  { value: 'all', label: '전체 권한' },
  { value: 'user', label: '일반' },
  { value: 'admin', label: '관리자' },
  { value: 'system', label: '시스템' },
]

const statusOptions = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'suspended', label: '정지' },
]

const authOptions = [
  { value: 'all', label: '전체 가입' },
  { value: 'password', label: '이메일' },
  { value: 'oauth', label: 'OAuth' },
]

function buildFilterHref(params: Record<string, string | undefined>, key: string, value: string) {
  const search = new URLSearchParams()

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (!paramValue || paramValue === 'all' || paramKey === key || paramKey === 'page') continue
    search.set(paramKey, paramValue)
  }

  if (value !== 'all') {
    search.set(key, value)
  }

  const query = search.toString()
  return query ? `/admin/users?${query}` : '/admin/users'
}

function buildPageHref(params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams()

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (!paramValue || paramValue === 'all' || paramKey === 'page') continue
    search.set(paramKey, paramValue)
  }

  if (page > 1) {
    search.set('page', String(page))
  }

  const query = search.toString()
  return query ? `/admin/users?${query}` : '/admin/users'
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
      <div className="text-sm font-black text-text-tertiary">{label}</div>
      <div className="mt-3 text-3xl font-black text-text-primary">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

function roleLabel(role: string) {
  if (role === 'admin') return '관리자'
  if (role === 'system') return '시스템'
  return '일반'
}

function statusLabel(status: string) {
  return status === 'suspended' ? '정지' : '활성'
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

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const filters = await searchParams
  const session = await auth()
  const actorId = session?.user?.id || ''

  const q = filters.q?.trim()
  const role = filters.role || 'all'
  const status = filters.status || 'all'
  const authFilter = filters.auth || 'all'
  const currentPage = Math.max(1, Number.parseInt(filters.page || '1', 10) || 1)
  const skip = (currentPage - 1) * pageSize

  const where: Prisma.UserWhereInput = {}

  if (role !== 'all') {
    where.role = role
  }

  if (status !== 'all') {
    where.status = status
  }

  if (authFilter === 'password') {
    where.password = { not: null }
  } else if (authFilter === 'oauth') {
    where.accounts = { some: {} }
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { id: { contains: q, mode: 'insensitive' } },
    ]
  }

  const memberWhere: Prisma.UserWhereInput = {
    role: { not: 'system' },
  }

  const [
    totalMembers,
    activeMembers,
    suspendedMembers,
    adminMembers,
    memberBalance,
    totalResults,
    activeAdminCount,
    users,
  ] = await Promise.all([
    prisma.user.count({ where: memberWhere }),
    prisma.user.count({ where: { ...memberWhere, status: 'active' } }),
    prisma.user.count({ where: { ...memberWhere, status: 'suspended' } }),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.aggregate({
      where: memberWhere,
      _sum: { dpmmBalance: true },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: 'admin', status: 'active' } }),
    prisma.user.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        dpmmBalance: true,
        createdAt: true,
        emailVerified: true,
        password: true,
        accounts: {
          select: {
            provider: true,
          },
        },
        balanceAdjustments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            delta: true,
            reason: true,
            createdAt: true,
          },
        },
        ledgerTransactions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            type: true,
            delta: true,
            balanceAfter: true,
            reason: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            predictions: true,
            createdMarkets: true,
            balanceAdjustments: true,
            ledgerTransactions: true,
          },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const filterParams = {
    q,
    role,
    status,
    auth: authFilter,
    page: filters.page,
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-black text-primary">Member Operations</div>
          <h1 className="mt-2 text-4xl font-black text-text-primary">회원 관리</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-text-secondary">
            회원 권한, 이용 상태, DPMM 잔액을 관리합니다.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="전체 회원" value={totalMembers.toLocaleString()} helper={`${activeMembers}명 활성`} />
        <StatCard label="정지 회원" value={suspendedMembers.toLocaleString()} helper="로그인 및 예측 제한" />
        <StatCard label="관리자" value={adminMembers.toLocaleString()} helper={`${activeAdminCount}명 활성 관리자`} />
        <StatCard label="총 DPMM" value={(memberBalance._sum.dpmmBalance || 0).toLocaleString()} helper="시스템 계정 제외" />
      </section>

      <section className="rounded-dopameme-lg border-3 border-light-border bg-white p-4 shadow-token-sm">
        <form className="grid gap-3 lg:grid-cols-[1fr_auto]" action="/admin/users">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="닉네임, 이메일, user id 검색"
            className="min-h-12 rounded-dopameme-md border-2 border-light-border px-4 text-sm font-semibold text-text-primary outline-none transition focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            검색
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {roleOptions.map((option) => (
            <Link
              key={option.value}
              href={buildFilterHref(filterParams, 'role', option.value)}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                role === option.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-light-border text-text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {option.label}
            </Link>
          ))}
          {statusOptions.map((option) => (
            <Link
              key={option.value}
              href={buildFilterHref(filterParams, 'status', option.value)}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                status === option.value
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-light-border text-text-secondary hover:border-secondary hover:text-secondary'
              }`}
            >
              {option.label}
            </Link>
          ))}
          {authOptions.map((option) => (
            <Link
              key={option.value}
              href={buildFilterHref(filterParams, 'auth', option.value)}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                authFilter === option.value
                  ? 'border-text-primary bg-text-primary text-white'
                  : 'border-light-border text-text-secondary hover:border-text-primary hover:text-text-primary'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
        <div className="flex flex-col gap-3 border-b-2 border-light-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-text-primary">회원 목록</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              {totalResults.toLocaleString()}개 결과 · {currentPage}/{totalPages} 페이지
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={buildPageHref(filterParams, Math.max(1, currentPage - 1))}
              aria-disabled={currentPage <= 1}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                currentPage <= 1
                  ? 'pointer-events-none border-light-border text-text-tertiary opacity-50'
                  : 'border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              이전
            </Link>
            <Link
              href={buildPageHref(filterParams, Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage >= totalPages}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                currentPage >= totalPages
                  ? 'pointer-events-none border-light-border text-text-tertiary opacity-50'
                  : 'border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              다음
            </Link>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="text-xl font-black text-text-primary">조건에 맞는 회원이 없습니다</div>
            <p className="mt-2 text-sm font-semibold text-text-tertiary">
              검색어 또는 필터를 조정하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse">
              <thead className="bg-light-bg-alt">
                <tr className="text-left text-xs font-black uppercase text-text-tertiary">
                  <th className="px-5 py-3">회원</th>
                  <th className="px-4 py-3">권한</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">DPMM</th>
                  <th className="px-4 py-3">활동</th>
                  <th className="px-4 py-3">가입</th>
                  <th className="px-5 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-light-border">
                {users.map((user) => {
                  const providers = [
                    user.password ? 'email' : null,
                    ...user.accounts.map((account) => account.provider),
                  ].filter(Boolean)
                  const isSystem = user.role === 'system'
                  const isLastActiveAdmin =
                    user.role === 'admin' && user.status === 'active' && activeAdminCount <= 1
                  const lastAdjustment = user.balanceAdjustments[0]
                  const lastLedger = user.ledgerTransactions[0]

                  return (
                    <tr key={user.id} className="align-top transition hover:bg-primary/5">
                      <td className="px-5 py-4">
                        <div className="font-black text-text-primary">
                          {user.name || '이름 없음'}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-text-secondary">
                          {user.email || '이메일 없음'}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {providers.length > 0 ? providers.map((provider) => (
                            <span
                              key={provider}
                              className="rounded-dopameme-pill bg-primary/10 px-3 py-1 text-xs font-black text-primary"
                            >
                              {provider}
                            </span>
                          )) : (
                            <span className="rounded-dopameme-pill bg-gray-100 px-3 py-1 text-xs font-black text-text-tertiary">
                              auth 없음
                            </span>
                          )}
                          {user.emailVerified && (
                            <span className="rounded-dopameme-pill bg-success/10 px-3 py-1 text-xs font-black text-success">
                              인증
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                          user.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : user.role === 'system'
                              ? 'bg-gray-100 text-text-tertiary'
                              : 'bg-secondary/10 text-secondary'
                        }`}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                          user.status === 'suspended'
                            ? 'bg-secondary/10 text-secondary'
                            : 'bg-success/10 text-success'
                        }`}>
                          {statusLabel(user.status)}
                        </span>
                        {isLastActiveAdmin && (
                          <div className="mt-2 text-xs font-bold text-text-tertiary">
                            마지막 활성 관리자
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-black text-text-primary">
                          {user.dpmmBalance.toLocaleString()}
                        </div>
                        {lastLedger && (
                          <div className="mt-1 max-w-[220px] text-xs font-semibold text-text-tertiary">
                            최근 ledger {lastLedger.delta > 0 ? '+' : ''}{lastLedger.delta.toLocaleString()} · {ledgerTypeLabel(lastLedger.type)}
                          </div>
                        )}
                        {lastAdjustment && (
                          <div className="mt-1 max-w-[220px] text-xs font-semibold text-text-tertiary/80">
                            조정 {lastAdjustment.delta > 0 ? '+' : ''}{lastAdjustment.delta.toLocaleString()} · {lastAdjustment.reason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-black text-text-primary">
                          예측 {user._count.predictions.toLocaleString()}건
                        </div>
                        <div className="mt-1 text-xs font-semibold text-text-tertiary">
                          생성 마켓 {user._count.createdMarkets.toLocaleString()}개 · ledger {user._count.ledgerTransactions.toLocaleString()}건 · 조정 {user._count.balanceAdjustments.toLocaleString()}건
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-text-secondary">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <AdminUserActions
                          userId={user.id}
                          role={user.role}
                          status={user.status}
                          isSelf={user.id === actorId}
                          isSystem={isSystem}
                          isLastActiveAdmin={isLastActiveAdmin}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
