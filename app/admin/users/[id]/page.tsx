import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import AdminUserActions from '../AdminUserActions'

export const dynamic = 'force-dynamic'

type AdminUserDetailPageProps = {
  params: Promise<{
    id: string
  }>
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
  if (type === 'prediction_liquidation') return '부분 청산'
  if (type === 'prediction_liquidation_fee') return '청산 수수료'
  if (type === 'position_purchase') return '포지션 구매'
  if (type === 'position_sale') return '포지션 판매'
  if (type === 'position_sale_fee') return '양도 수수료'
  if (type === 'market_payout') return '정산 보상'
  if (type === 'market_fee') return '정산 수수료'
  if (type === 'withdrawal_request') return '출금 요청'
  if (type === 'withdrawal_refund') return '출금 복원'
  if (type === 'level_reward') return '레벨 보상'
  if (type === 'item_purchase') return '아이템 구매'
  return type
}

function predictionStatusLabel(resolved: number) {
  if (resolved === 1) return '적중'
  if (resolved === -1) return '실패'
  return '진행 중'
}

function withdrawalStatusLabel(status: string) {
  if (status === 'pending') return '검토 대기'
  if (status === 'approved') return '승인'
  if (status === 'submitted') return '전송됨'
  if (status === 'confirmed') return '확정'
  if (status === 'rejected') return '거절'
  if (status === 'failed') return '실패'
  return status
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

function DeltaText({ delta }: { delta: number }) {
  return (
    <span className={delta >= 0 ? 'text-success' : 'text-secondary'}>
      {delta > 0 ? '+' : ''}{delta.toLocaleString()}
    </span>
  )
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params

  if (!id || id.length > 128) {
    notFound()
  }

  const session = await auth()
  const actorId = session?.user?.id || ''

  const [
    user,
    activeAdminCount,
    ledgerCount,
    ledgerCredits,
    ledgerDebits,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
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
        solanaWallet: {
          select: {
            address: true,
            cluster: true,
            walletProvider: true,
            verifiedAt: true,
          },
        },
        ledgerTransactions: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            delta: true,
            balanceAfter: true,
            reason: true,
            sourceType: true,
            sourceId: true,
            createdAt: true,
            actor: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        predictions: {
          take: 20,
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
              },
            },
            option: {
              select: {
                title: true,
              },
            },
          },
        },
        withdrawalRequests: {
          take: 20,
          orderBy: { requestedAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            walletAddress: true,
            cluster: true,
            txSignature: true,
            userNote: true,
            requestedAt: true,
            reviewedAt: true,
            submittedAt: true,
            confirmedAt: true,
            failedAt: true,
          },
        },
        balanceAdjustments: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            delta: true,
            reason: true,
            createdAt: true,
            admin: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            predictions: true,
            withdrawalRequests: true,
            balanceAdjustments: true,
            ledgerTransactions: true,
            createdMarkets: true,
          },
        },
      },
    }),
    prisma.user.count({ where: { role: 'admin', status: 'active' } }),
    prisma.dpmmLedgerTransaction.count({ where: { userId: id } }),
    prisma.dpmmLedgerTransaction.aggregate({
      where: { userId: id, delta: { gt: 0 } },
      _sum: { delta: true },
    }),
    prisma.dpmmLedgerTransaction.aggregate({
      where: { userId: id, delta: { lt: 0 } },
      _sum: { delta: true },
    }),
  ])

  if (!user) {
    notFound()
  }

  const providers = [
    user.password ? 'email' : null,
    ...user.accounts.map((account) => account.provider),
  ].filter(Boolean)
  const isSystem = user.role === 'system'
  const isLastActiveAdmin =
    user.role === 'admin' && user.status === 'active' && activeAdminCount <= 1
  const totalCredits = ledgerCredits._sum.delta || 0
  const totalDebits = Math.abs(ledgerDebits._sum.delta || 0)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-sm font-black text-primary hover:text-primary-dark"
          >
            회원 관리로 돌아가기
          </Link>
          <h1 className="mt-3 text-4xl font-black text-text-primary">
            {user.name || user.email || '이름 없음'}
          </h1>
          <p className="mt-3 max-w-3xl break-all text-base font-semibold text-text-secondary">
            {user.email || '이메일 없음'} · {user.id}
          </p>
        </div>
        <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-4 shadow-token-sm lg:min-w-[420px]">
          <AdminUserActions
            userId={user.id}
            role={user.role}
            status={user.status}
            isSelf={user.id === actorId}
            isSystem={isSystem}
            isLastActiveAdmin={isLastActiveAdmin}
          />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="현재 DPMM"
          value={user.dpmmBalance.toLocaleString()}
          helper={`${ledgerCount.toLocaleString()}개 ledger`}
        />
        <StatCard
          label="총 유입"
          value={totalCredits.toLocaleString()}
          helper="양수 ledger 합계"
        />
        <StatCard
          label="총 사용"
          value={totalDebits.toLocaleString()}
          helper="음수 ledger 절대값"
        />
        <StatCard
          label="활동"
          value={user._count.predictions.toLocaleString()}
          helper={`${user._count.withdrawalRequests.toLocaleString()}개 출금 요청`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
          <h2 className="text-lg font-black text-text-primary">회원 정보</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-bold text-text-tertiary">권한 / 상태</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-dopameme-pill bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                  {roleLabel(user.role)}
                </span>
                <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${
                  user.status === 'suspended'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-success/10 text-success'
                }`}>
                  {statusLabel(user.status)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">가입 방식</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {providers.length ? providers.map((provider) => (
                  <span
                    key={provider}
                    className="rounded-dopameme-pill bg-light-bg-alt px-3 py-1 text-xs font-black text-text-secondary"
                  >
                    {provider}
                  </span>
                )) : (
                  <span className="text-text-secondary">auth 없음</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">가입일</dt>
              <dd className="mt-1 font-black text-text-primary">
                {formatDate(user.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">이메일 인증</dt>
              <dd className="mt-1 font-black text-text-primary">
                {user.emailVerified ? formatDate(user.emailVerified) : '미인증'}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">Solana 지갑</dt>
              <dd className="mt-1 break-all font-mono text-xs text-text-secondary">
                {user.solanaWallet
                  ? `${user.solanaWallet.address} · ${user.solanaWallet.cluster} · ${user.solanaWallet.walletProvider || 'unknown'}`
                  : '연결된 지갑 없음'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">DPMM Ledger</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              최근 50개 거래 · balanceAfter 기준 추적
            </p>
          </div>
          {user.ledgerTransactions.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm font-semibold text-text-secondary">
              ledger 기록이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse">
                <thead className="bg-light-bg-alt">
                  <tr className="text-left text-xs font-black uppercase text-text-tertiary">
                    <th className="px-5 py-3">시간</th>
                    <th className="px-4 py-3">유형</th>
                    <th className="px-4 py-3 text-right">변동</th>
                    <th className="px-4 py-3 text-right">잔액</th>
                    <th className="px-4 py-3">출처</th>
                    <th className="px-5 py-3">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-light-border">
                  {user.ledgerTransactions.map((entry) => (
                    <tr key={entry.id} className="align-top">
                      <td className="px-5 py-4 text-xs font-bold text-text-secondary">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-text-primary">
                        {ledgerTypeLabel(entry.type)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-black">
                        <DeltaText delta={entry.delta} />
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-black text-text-primary">
                        {entry.balanceAfter.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono text-xs font-bold text-text-secondary">
                          {entry.sourceType || '-'}
                        </div>
                        {entry.sourceId && (
                          <div className="mt-1 break-all font-mono text-xs text-text-tertiary">
                            {entry.sourceId}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-text-secondary">
                        <div>{entry.reason || '-'}</div>
                        {entry.actor && (
                          <div className="mt-1 text-text-tertiary">
                            actor {entry.actor.name || entry.actor.email || '관리자'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">예측 내역</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              최근 20개
            </p>
          </div>
          <div className="divide-y-2 divide-light-border">
            {user.predictions.length ? user.predictions.map((prediction) => (
              <div key={prediction.id} className="px-5 py-4">
                <Link
                  href={`/markets/${prediction.market.id}`}
                  className="line-clamp-2 text-sm font-black text-text-primary hover:text-primary"
                >
                  {prediction.market.title}
                </Link>
                <div className="mt-2 text-xs font-semibold text-text-secondary">
                  {prediction.option.title} · {predictionStatusLabel(prediction.resolved)}
                </div>
                <div className="mt-2 flex justify-between text-xs font-black">
                  <span className="text-secondary">-{prediction.amount.toLocaleString()}</span>
                  <span className="text-success">+{prediction.payout.toLocaleString()}</span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-12 text-center text-sm font-semibold text-text-secondary">
                예측 내역이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">출금 요청</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              최근 20개
            </p>
          </div>
          <div className="divide-y-2 divide-light-border">
            {user.withdrawalRequests.length ? user.withdrawalRequests.map((request) => (
              <div key={request.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-black text-text-primary">
                    {request.amount.toLocaleString()} DPMM
                  </div>
                  <span className="rounded-dopameme-pill bg-light-bg-alt px-3 py-1 text-xs font-black text-text-secondary">
                    {withdrawalStatusLabel(request.status)}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-text-tertiary">
                  {formatDate(request.requestedAt)}
                </div>
                <div className="mt-2 break-all font-mono text-xs text-text-secondary">
                  {request.walletAddress}
                </div>
                {request.txSignature && (
                  <div className="mt-2 break-all font-mono text-xs text-primary">
                    {request.txSignature}
                  </div>
                )}
                {request.userNote && (
                  <div className="mt-2 text-xs font-semibold text-text-secondary">
                    {request.userNote}
                  </div>
                )}
              </div>
            )) : (
              <div className="px-5 py-12 text-center text-sm font-semibold text-text-secondary">
                출금 요청이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-dopameme-lg border-3 border-light-border bg-white shadow-token-sm">
          <div className="border-b-2 border-light-border px-5 py-4">
            <h2 className="text-lg font-black text-text-primary">관리자 조정</h2>
            <p className="mt-1 text-sm font-semibold text-text-tertiary">
              최근 20개
            </p>
          </div>
          <div className="divide-y-2 divide-light-border">
            {user.balanceAdjustments.length ? user.balanceAdjustments.map((adjustment) => (
              <div key={adjustment.id} className="px-5 py-4">
                <div className="text-sm font-black">
                  <DeltaText delta={adjustment.delta} /> DPMM
                </div>
                <div className="mt-2 text-xs font-semibold text-text-secondary">
                  {adjustment.reason}
                </div>
                <div className="mt-2 text-xs font-semibold text-text-tertiary">
                  {formatDate(adjustment.createdAt)} · {adjustment.admin.name || adjustment.admin.email || '관리자'}
                </div>
              </div>
            )) : (
              <div className="px-5 py-12 text-center text-sm font-semibold text-text-secondary">
                관리자 조정 내역이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
