import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import AdminWithdrawalActions from './AdminWithdrawalActions'

export const dynamic = 'force-dynamic'

type AdminWithdrawalsPageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    page?: string
  }>
}

const pageSize = 25

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '검토 대기' },
  { value: 'approved', label: '승인' },
  { value: 'submitted', label: '전송됨' },
  { value: 'confirmed', label: '확정' },
  { value: 'rejected', label: '거절' },
  { value: 'failed', label: '실패' },
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
  return query ? `/admin/withdrawals?${query}` : '/admin/withdrawals'
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
  return query ? `/admin/withdrawals?${query}` : '/admin/withdrawals'
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

function statusLabel(status: string) {
  if (status === 'pending') return '검토 대기'
  if (status === 'approved') return '승인'
  if (status === 'submitted') return '전송됨'
  if (status === 'confirmed') return '확정'
  if (status === 'rejected') return '거절'
  if (status === 'failed') return '실패'
  return status
}

function statusClass(status: string) {
  if (status === 'pending') return 'bg-accent-yellow/15 text-accent-yellow'
  if (status === 'approved') return 'bg-primary/10 text-primary'
  if (status === 'submitted') return 'bg-accent-cyan/10 text-accent-cyan'
  if (status === 'confirmed') return 'bg-success/10 text-success'
  if (status === 'rejected' || status === 'failed') return 'bg-secondary/10 text-secondary'
  return 'bg-light-bg-alt text-text-secondary'
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

export default async function AdminWithdrawalsPage({ searchParams }: AdminWithdrawalsPageProps) {
  const filters = await searchParams
  const q = filters.q?.trim()
  const status = filters.status || 'all'
  const currentPage = Math.max(1, Number.parseInt(filters.page || '1', 10) || 1)
  const skip = (currentPage - 1) * pageSize

  const where: Prisma.SolanaWithdrawalRequestWhereInput = {}

  if (status !== 'all') {
    where.status = status
  }

  if (q) {
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { walletAddress: { contains: q, mode: 'insensitive' } },
      { txSignature: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const filterParams = {
    q,
    status,
    page: filters.page,
  }

  const [
    totalRequests,
    pendingRequests,
    approvedRequests,
    submittedRequests,
    confirmedRequests,
    requestedAmount,
    totalResults,
    requests,
  ] = await Promise.all([
    prisma.solanaWithdrawalRequest.count(),
    prisma.solanaWithdrawalRequest.count({ where: { status: 'pending' } }),
    prisma.solanaWithdrawalRequest.count({ where: { status: 'approved' } }),
    prisma.solanaWithdrawalRequest.count({ where: { status: 'submitted' } }),
    prisma.solanaWithdrawalRequest.count({ where: { status: 'confirmed' } }),
    prisma.solanaWithdrawalRequest.aggregate({
      where: { status: { in: ['pending', 'approved', 'submitted'] } },
      _sum: { amount: true },
    }),
    prisma.solanaWithdrawalRequest.count({ where }),
    prisma.solanaWithdrawalRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        walletAddress: true,
        cluster: true,
        amount: true,
        status: true,
        txSignature: true,
        adminNote: true,
        userNote: true,
        requestedAt: true,
        reviewedAt: true,
        submittedAt: true,
        confirmedAt: true,
        failedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            dpmmBalance: true,
          },
        },
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-black text-primary">Withdrawal Operations</div>
          <h1 className="mt-2 text-4xl font-black text-text-primary">DPMM 출금 관리</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-text-secondary">
            사용자 장부 DPMM 출금 요청을 검토하고 on-chain 전송 상태를 기록합니다.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="전체 요청" value={totalRequests.toLocaleString()} helper={`${pendingRequests}건 검토 대기`} />
        <StatCard label="승인 대기" value={approvedRequests.toLocaleString()} helper="수동 전송 필요" />
        <StatCard label="전송 확인" value={submittedRequests.toLocaleString()} helper={`${confirmedRequests}건 확정`} />
        <StatCard label="잠긴 DPMM" value={(requestedAmount._sum.amount || 0).toLocaleString()} helper="처리 중 출금액" />
      </section>

      <section className="rounded-dopameme-lg border-3 border-light-border bg-white p-4 shadow-token-sm">
        <form className="grid gap-3 lg:grid-cols-[1fr_auto]" action="/admin/withdrawals">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="회원, 지갑 주소, request id, tx signature 검색"
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
          {statusOptions.map((option) => (
            <Link
              key={option.value}
              href={buildFilterHref(filterParams, 'status', option.value)}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                status === option.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-light-border text-text-secondary hover:border-primary hover:text-primary'
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
            <h2 className="text-lg font-black text-text-primary">출금 요청 목록</h2>
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

        {requests.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="text-xl font-black text-text-primary">조건에 맞는 출금 요청이 없습니다</div>
            <p className="mt-2 text-sm font-semibold text-text-tertiary">
              검색어 또는 필터를 조정하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse">
              <thead className="bg-light-bg-alt">
                <tr className="text-left text-xs font-black uppercase text-text-tertiary">
                  <th className="px-5 py-3">요청</th>
                  <th className="px-4 py-3">회원</th>
                  <th className="px-4 py-3">출금 지갑</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">Tx</th>
                  <th className="px-4 py-3">관리</th>
                  <th className="px-5 py-3 text-right">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-light-border">
                {requests.map((request) => (
                  <tr key={request.id} className="align-top transition hover:bg-primary/5">
                    <td className="px-5 py-4">
                      <div className="text-lg font-black text-text-primary">
                        {request.amount.toLocaleString()} DPMM
                      </div>
                      <div className="mt-1 text-xs font-semibold text-text-tertiary">
                        {formatDate(request.requestedAt)}
                      </div>
                      <div className="mt-2 font-mono text-xs text-text-tertiary">
                        {request.id}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-black text-text-primary">
                        {request.user.name || '이름 없음'}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-text-secondary">
                        {request.user.email || '이메일 없음'}
                      </div>
                      <div className="mt-2 text-xs font-bold text-text-tertiary">
                        잔액 {request.user.dpmmBalance.toLocaleString()} DPMM
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="break-all font-mono text-xs font-bold text-text-secondary">
                        {request.walletAddress}
                      </div>
                      <div className="mt-2 text-xs font-black text-text-tertiary">
                        {request.cluster}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${statusClass(request.status)}`}>
                        {statusLabel(request.status)}
                      </span>
                      {request.adminNote && (
                        <div className="mt-2 max-w-[220px] text-xs font-semibold text-text-tertiary">
                          내부: {request.adminNote}
                        </div>
                      )}
                      {request.userNote && (
                        <div className="mt-2 max-w-[220px] text-xs font-semibold text-text-tertiary">
                          사용자: {request.userNote}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {request.txSignature ? (
                        <div className="break-all font-mono text-xs font-bold text-text-secondary">
                          {request.txSignature}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-text-tertiary">미기록</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-text-secondary">
                        {request.admin
                          ? request.admin.name || request.admin.email || '관리자'
                          : '미배정'}
                      </div>
                      <div className="mt-2 space-y-1 text-xs font-semibold text-text-tertiary">
                        {request.reviewedAt && <div>검토 {formatDate(request.reviewedAt)}</div>}
                        {request.submittedAt && <div>전송 {formatDate(request.submittedAt)}</div>}
                        {request.confirmedAt && <div>확정 {formatDate(request.confirmedAt)}</div>}
                        {request.failedAt && <div>실패 {formatDate(request.failedAt)}</div>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <AdminWithdrawalActions
                        requestId={request.id}
                        status={request.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
