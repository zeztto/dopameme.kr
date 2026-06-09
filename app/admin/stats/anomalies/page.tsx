import Link from 'next/link'
import { getAnomalyDetectionOverview, type AnomalyAlert, type AnomalyDetectionType } from '@/lib/anomaly-detection'

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

function severityLabel(severity: AnomalyAlert['severity']) {
  if (severity === 'critical') return '긴급'
  if (severity === 'high') return '높음'
  if (severity === 'medium') return '주의'
  return '낮음'
}

function typeLabel(type: AnomalyDetectionType) {
  if (type === 'prediction_velocity') return '예측 급증'
  if (type === 'market_concentration') return '마켓 집중'
  if (type === 'ledger_velocity') return '장부 변동'
  if (type === 'withdrawal_pressure') return '출금 압력'
  if (type === 'position_transfer_velocity') return '포지션 회전'
  return type
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

function barClass(tone: Tone) {
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
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

function ScoreBar({ score, tone }: { score: number; tone: Tone }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black text-text-tertiary">
        <span>Risk score</span>
        <span>{score}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-dopameme-pill bg-light-bg-alt">
        <div
          className={`h-full rounded-dopameme-pill ${barClass(tone)}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <section className="rounded-dopameme-lg border-3 border-light-border bg-white px-5 py-16 text-center shadow-token-sm">
      <h2 className="text-2xl font-black text-text-primary">탐지된 이상 신호가 없습니다</h2>
      <p className="mt-3 text-sm font-semibold text-text-secondary">
        최근 24시간 기준으로 임계값을 넘은 예측, 장부, 출금, 포지션 거래 신호가 없습니다.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
        >
          회원 관리
        </Link>
        <Link
          href="/admin/stats/markets"
          className="inline-flex items-center justify-center rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white shadow-token-brand transition hover:bg-primary-dark"
        >
          마켓 통계
        </Link>
      </div>
    </section>
  )
}

export default async function AdminAnomalyStatsPage() {
  const overview = await getAnomalyDetectionOverview()
  const highestAlert = overview.alerts[0] || null

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b-3 border-primary/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-black text-primary">Anomaly Detection</div>
          <h1 className="mt-2 text-4xl font-black text-text-primary">이상 거래 탐지</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-text-secondary">
            최근 예측, DPMM ledger, 출금 요청, 포지션 거래 신호를 비교해 운영자가 확인할 계정을 찾습니다.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/stats/markets"
            className="inline-flex items-center justify-center rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          >
            마켓 통계
          </Link>
          <Link
            href="/admin/withdrawals"
            className="inline-flex items-center justify-center rounded-dopameme-pill border-3 border-secondary bg-white px-6 py-3 text-sm font-black text-secondary transition hover:bg-secondary hover:text-white"
          >
            출금 관리
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white shadow-token-brand transition hover:bg-primary-dark"
          >
            회원 관리
          </Link>
        </div>
      </header>

      <section className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-text-primary">탐지 모델</div>
            <div className="mt-1 text-sm font-semibold text-text-secondary">
              {overview.modelVersion} · 최근 {overview.windowHours}시간
            </div>
          </div>
          <div className="text-sm font-semibold text-text-tertiary">
            생성 {formatDateTime(overview.generatedAt)} · 기준 {overview.baselineDays}일
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="탐지 알림"
          value={overview.totalAlerts.toLocaleString()}
          helper={`긴급 ${overview.criticalAlerts.toLocaleString()} · 높음 ${overview.highAlerts.toLocaleString()}`}
          tone={overview.criticalAlerts > 0 ? 'secondary' : overview.highAlerts > 0 ? 'warning' : 'primary'}
        />
        <StatCard
          label="관찰 사용자"
          value={overview.watchedUsers.toLocaleString()}
          helper="최근 신호가 있는 non-system 계정"
          tone="primary"
        />
        <StatCard
          label="최근 stake"
          value={overview.totalRecentStake.toLocaleString()}
          helper="최근 24시간 공개 마켓 예측"
          tone="success"
        />
        <StatCard
          label="열린 출금"
          value={overview.openWithdrawalAmount.toLocaleString()}
          helper="pending/approved/submitted 합계"
          tone="warning"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
          <h2 className="text-lg font-black text-text-primary">운영 기준</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-dopameme-md border-2 border-primary/20 bg-primary/5 p-4">
              <div className="text-sm font-black text-text-primary">Read-only</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                이 화면은 계정 정지, 잔액 변경, 출금 거절을 자동 수행하지 않습니다.
              </p>
            </div>
            <div className="rounded-dopameme-md border-2 border-secondary/20 bg-secondary/5 p-4">
              <div className="text-sm font-black text-text-primary">Manual Review</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                score는 우선순위입니다. 확정 조치 전 회원 상세, 마켓, 출금 큐를 함께 확인합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-5 shadow-token-sm">
          <h2 className="text-lg font-black text-text-primary">최상위 신호</h2>
          {highestAlert ? (
            <div className={`mt-4 rounded-dopameme-md border-3 p-5 ${toneClass(highestAlert.tone)}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-dopameme-pill bg-white px-3 py-1 text-xs font-black text-text-primary">
                  {severityLabel(highestAlert.severity)}
                </span>
                <span className="rounded-dopameme-pill bg-white px-3 py-1 text-xs font-bold text-text-tertiary">
                  {typeLabel(highestAlert.type)}
                </span>
              </div>
              <div className="mt-3 text-xl font-black text-text-primary">{highestAlert.title}</div>
              <p className="mt-2 text-sm font-semibold text-text-secondary">
                {highestAlert.userName} · {highestAlert.primaryMetric}
              </p>
              <div className="mt-4">
                <ScoreBar score={highestAlert.score} tone={highestAlert.tone} />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-dopameme-md bg-light-bg-alt px-4 py-8 text-center text-sm font-semibold text-text-secondary">
              현재 우선 확인할 이상 신호가 없습니다.
            </div>
          )}
        </div>
      </section>

      {overview.alerts.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-4">
          {overview.alerts.map((alert) => (
            <article
              key={alert.id}
              className={`rounded-dopameme-lg border-3 bg-white p-5 shadow-token-sm ${toneClass(alert.tone)}`}
            >
              <div className="grid gap-5 xl:grid-cols-[1fr_240px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-dopameme-pill bg-white px-3 py-1 text-xs font-black text-text-primary">
                      {severityLabel(alert.severity)}
                    </span>
                    <span className="rounded-dopameme-pill bg-white px-3 py-1 text-xs font-bold text-text-tertiary">
                      {typeLabel(alert.type)}
                    </span>
                    <span className="rounded-dopameme-pill bg-light-bg-alt px-3 py-1 text-xs font-bold text-text-tertiary">
                      {alert.userStatus}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-text-primary">{alert.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-text-secondary">
                    {alert.userName}{alert.userEmail ? ` · ${alert.userEmail}` : ''} · {alert.primaryMetric} · {alert.secondaryMetric}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {alert.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-dopameme-pill border border-light-border bg-white px-3 py-1 text-xs font-bold text-text-secondary"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {alert.evidence.map((item) => (
                      <div key={`${alert.id}-${item.label}`} className="rounded-dopameme-md border-2 border-light-border bg-white p-4">
                        <div className="text-xs font-black text-text-tertiary">{item.label}</div>
                        <div className="mt-2 break-words text-sm font-black text-text-primary">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-dopameme-md border-3 border-light-border bg-white p-5">
                  <div className="text-xs font-black text-text-tertiary">Risk score</div>
                  <div className="mt-2 text-5xl font-black text-primary">{alert.score}%</div>
                  <div className="mt-5">
                    <ScoreBar score={alert.score} tone={alert.tone} />
                  </div>
                  <div className="mt-5 rounded-dopameme-md bg-light-bg-alt px-4 py-3">
                    <div className="text-xs font-black text-text-tertiary">DPMM exposure</div>
                    <div className="mt-1 text-lg font-black text-secondary">
                      {alert.amountDpmm.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2">
                    <Link
                      href={`/admin/users/${alert.userId}`}
                      className="inline-flex items-center justify-center rounded-dopameme-pill border-3 border-primary bg-white px-4 py-2.5 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
                    >
                      회원 상세
                    </Link>
                    <Link
                      href={alert.targetPath}
                      className="inline-flex items-center justify-center rounded-dopameme-pill bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark"
                    >
                      근거 확인
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
