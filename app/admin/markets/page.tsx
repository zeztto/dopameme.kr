import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import AdminMarketActions from './AdminMarketActions'

export const dynamic = 'force-dynamic'

type AdminMarketsPageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    source?: string
    visibility?: string
  }>
}

const statusOptions = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'resolved', label: '확정' },
]

const sourceOptions = [
  { value: 'all', label: '전체 소스' },
  { value: 'mock', label: '목업' },
  { value: 'admin', label: '운영' },
]

const visibilityOptions = [
  { value: 'all', label: '전체 노출' },
  { value: 'visible', label: '노출' },
  { value: 'hidden', label: '숨김' },
]

function buildFilterHref(params: Record<string, string | undefined>, key: string, value: string) {
  const search = new URLSearchParams()

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (!paramValue || paramValue === 'all' || paramKey === key) continue
    search.set(paramKey, paramValue)
  }

  if (value !== 'all') {
    search.set(key, value)
  }

  const query = search.toString()
  return query ? `/admin/markets?${query}` : '/admin/markets'
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

export default async function AdminMarketsPage({ searchParams }: AdminMarketsPageProps) {
  const filters = await searchParams
  const q = filters.q?.trim()
  const status = filters.status || 'all'
  const source = filters.source || 'all'
  const visibility = filters.visibility || 'all'

  const where: Prisma.MarketWhereInput = {}

  if (status !== 'all') {
    where.status = status
  }

  if (source !== 'all') {
    where.source = source
  }

  if (visibility === 'hidden') {
    where.hidden = true
  } else if (visibility === 'visible') {
    where.hidden = false
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ]
  }

  const markets = await prisma.market.findMany({
    where,
    orderBy: [
      { hidden: 'asc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      source: true,
      hidden: true,
      createdAt: true,
      endsAt: true,
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      options: {
        select: {
          totalAmount: true,
          totalPredictions: true,
        },
      },
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })

  const filterParams = { q, status, source, visibility }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-black text-primary">Market Operations</div>
          <h1 className="mt-2 text-4xl font-black text-text-primary">마켓 관리</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-text-secondary">
            목업 마켓과 운영 마켓을 구분하고 노출 상태를 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/markets/create"
          className="inline-flex items-center justify-center rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white shadow-token-brand transition hover:bg-primary-dark"
        >
          새 마켓 생성
        </Link>
      </header>

      <section className="rounded-dopameme-lg border-3 border-light-border bg-white p-4 shadow-token-sm">
        <form className="grid gap-3 lg:grid-cols-[1fr_auto]" action="/admin/markets">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="제목, 설명, 카테고리 검색"
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
          {sourceOptions.map((option) => (
            <Link
              key={option.value}
              href={buildFilterHref(filterParams, 'source', option.value)}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                source === option.value
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-light-border text-text-secondary hover:border-secondary hover:text-secondary'
              }`}
            >
              {option.label}
            </Link>
          ))}
          {visibilityOptions.map((option) => (
            <Link
              key={option.value}
              href={buildFilterHref(filterParams, 'visibility', option.value)}
              className={`rounded-dopameme-pill border-2 px-4 py-2 text-xs font-black transition ${
                visibility === option.value
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
        <div className="flex items-center justify-between border-b-2 border-light-border px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-text-primary">마켓 목록</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              {markets.length.toLocaleString()}개 결과
            </p>
          </div>
        </div>

        {markets.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="text-xl font-black text-text-primary">조건에 맞는 마켓이 없습니다</div>
            <p className="mt-2 text-sm font-semibold text-text-tertiary">
              검색어 또는 필터를 조정하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="bg-light-bg-alt">
                <tr className="text-left text-xs font-black uppercase text-text-tertiary">
                  <th className="px-5 py-3">마켓</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">소스</th>
                  <th className="px-4 py-3">참여</th>
                  <th className="px-4 py-3">마감</th>
                  <th className="px-5 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-light-border">
                {markets.map((market) => {
                  const volume = market.options.reduce((sum, option) => sum + option.totalAmount, 0)
                  const predictions = market._count.predictions

                  return (
                    <tr key={market.id} className="align-top transition hover:bg-primary/5">
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-dopameme-pill bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                            {market.category}
                          </span>
                          {market.hidden && (
                            <span className="rounded-dopameme-pill bg-gray-100 px-3 py-1 text-xs font-black text-text-tertiary">
                              숨김
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/markets/${market.id}`}
                          className="mt-2 block max-w-xl text-base font-black text-text-primary hover:text-primary"
                        >
                          {market.title}
                        </Link>
                        <div className="mt-1 text-xs font-semibold text-text-tertiary">
                          {market.creator.name || market.creator.email || 'unknown'} · {formatDate(market.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                          market.status === 'resolved'
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {market.status === 'resolved' ? '확정' : '활성'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                          market.source === 'mock'
                            ? 'bg-accent-yellow/15 text-accent-yellow'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {market.source === 'mock' ? '목업' : '운영'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-black text-text-primary">
                          {predictions.toLocaleString()}건
                        </div>
                        <div className="mt-1 text-xs font-semibold text-text-tertiary">
                          {volume.toLocaleString()} DPMM
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-text-secondary">
                        {formatDate(market.endsAt)}
                      </td>
                      <td className="px-5 py-4">
                        <AdminMarketActions
                          marketId={market.id}
                          hidden={market.hidden}
                          canDelete={market.hidden && market.status !== 'resolved' && predictions === 0}
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
