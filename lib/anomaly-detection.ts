import { prisma } from '@/lib/db'

type Severity = 'critical' | 'high' | 'medium' | 'low'
type Tone = 'secondary' | 'warning' | 'primary' | 'success'

type UserSummary = {
  id: string
  name: string | null
  email: string | null
  role: string
  status: string
  dpmmBalance: number
}

type UserSignal = {
  user: UserSummary
  recentPredictionCount: number
  previousPredictionCount: number
  recentStake: number
  previousStake: number
  recentLedgerCount: number
  recentLedgerAbsMovement: number
  recentLedgerPositive: number
  recentLedgerNegative: number
  recentLiquidationCount: number
  recentListingCount: number
  recentListingAmount: number
  recentWithdrawalAmount: number
  openWithdrawalAmount: number
}

export type AnomalyDetectionType =
  | 'prediction_velocity'
  | 'market_concentration'
  | 'ledger_velocity'
  | 'withdrawal_pressure'
  | 'position_transfer_velocity'

export type AnomalyEvidence = {
  label: string
  value: string
}

export type AnomalyAlert = {
  id: string
  type: AnomalyDetectionType
  title: string
  severity: Severity
  tone: Tone
  score: number
  userId: string
  userName: string
  userEmail: string | null
  userStatus: string
  amountDpmm: number
  primaryMetric: string
  secondaryMetric: string
  targetPath: string
  detectedAt: Date
  reasons: string[]
  evidence: AnomalyEvidence[]
}

export type AnomalyDetectionOverview = {
  modelVersion: string
  generatedAt: Date
  windowHours: number
  baselineDays: number
  recentStart: Date
  baselineStart: Date
  totalAlerts: number
  criticalAlerts: number
  highAlerts: number
  mediumAlerts: number
  watchedUsers: number
  totalRecentStake: number
  totalRecentLedgerMovement: number
  openWithdrawalAmount: number
  alerts: AnomalyAlert[]
}

const RECENT_WINDOW_HOURS = 24
const BASELINE_DAYS = 7
const MIN_ALERT_SCORE = 45

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000)
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function percentShare(part: number, total: number) {
  if (total <= 0) return 0
  return (part / total) * 100
}

function severityFromScore(score: number): Severity {
  if (score >= 85) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 45) return 'medium'
  return 'low'
}

function toneFromSeverity(severity: Severity): Tone {
  if (severity === 'critical') return 'secondary'
  if (severity === 'high') return 'warning'
  if (severity === 'medium') return 'primary'
  return 'success'
}

function formatDpmm(value: number) {
  return `${Math.round(value).toLocaleString()} DPMM`
}

function formatCount(value: number, unit = '건') {
  return `${value.toLocaleString()}${unit}`
}

function displayName(user: UserSummary) {
  return user.name || user.email || `user-${user.id.slice(0, 8)}`
}

function createSignal(user: UserSummary): UserSignal {
  return {
    user,
    recentPredictionCount: 0,
    previousPredictionCount: 0,
    recentStake: 0,
    previousStake: 0,
    recentLedgerCount: 0,
    recentLedgerAbsMovement: 0,
    recentLedgerPositive: 0,
    recentLedgerNegative: 0,
    recentLiquidationCount: 0,
    recentListingCount: 0,
    recentListingAmount: 0,
    recentWithdrawalAmount: 0,
    openWithdrawalAmount: 0,
  }
}

function createAlert(input: Omit<AnomalyAlert, 'severity' | 'tone' | 'detectedAt'> & { detectedAt?: Date }): AnomalyAlert {
  const severity = severityFromScore(input.score)

  return {
    ...input,
    severity,
    tone: toneFromSeverity(severity),
    detectedAt: input.detectedAt || new Date(),
  }
}

function pushAlert(alerts: AnomalyAlert[], alert: AnomalyAlert) {
  if (alert.score < MIN_ALERT_SCORE) return
  alerts.push(alert)
}

export async function getAnomalyDetectionOverview(): Promise<AnomalyDetectionOverview> {
  const now = new Date()
  const recentStart = hoursAgo(RECENT_WINDOW_HOURS)
  const baselineStart = daysAgo(BASELINE_DAYS + 1)

  const [
    users,
    predictionRows,
    marketRows,
    ledgerRows,
    withdrawalRows,
    listingRows,
  ] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { not: 'system' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        dpmmBalance: true,
      },
    }),
    prisma.prediction.findMany({
      where: {
        createdAt: { gte: baselineStart },
      },
      select: {
        userId: true,
        amount: true,
        createdAt: true,
        marketId: true,
        optionId: true,
        market: {
          select: {
            id: true,
            title: true,
            hidden: true,
            status: true,
          },
        },
      },
    }),
    prisma.market.findMany({
      where: {
        OR: [
          { status: 'active' },
          { createdAt: { gte: baselineStart } },
        ],
      },
      select: {
        id: true,
        title: true,
        hidden: true,
        status: true,
        predictions: {
          select: {
            userId: true,
            amount: true,
          },
        },
      },
    }),
    prisma.dpmmLedgerTransaction.findMany({
      where: {
        createdAt: { gte: recentStart },
      },
      select: {
        userId: true,
        type: true,
        delta: true,
        balanceAfter: true,
        sourceType: true,
        sourceId: true,
        createdAt: true,
      },
    }),
    prisma.solanaWithdrawalRequest.findMany({
      where: {
        OR: [
          { requestedAt: { gte: recentStart } },
          { status: { in: ['pending', 'approved', 'submitted'] } },
        ],
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        status: true,
        requestedAt: true,
      },
    }),
    prisma.positionListing.findMany({
      where: {
        OR: [
          { createdAt: { gte: recentStart } },
          { soldAt: { gte: recentStart } },
          { cancelledAt: { gte: recentStart } },
        ],
      },
      select: {
        sellerId: true,
        buyerId: true,
        amount: true,
        price: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  const userMap = new Map(users.map((user) => [user.id, user]))
  const signalMap = new Map<string, UserSignal>()

  function signalForUser(userId: string) {
    const user = userMap.get(userId)
    if (!user) return null

    const existing = signalMap.get(userId)
    if (existing) return existing

    const signal = createSignal(user)
    signalMap.set(userId, signal)
    return signal
  }

  for (const prediction of predictionRows) {
    if (prediction.market.hidden) continue

    const signal = signalForUser(prediction.userId)
    if (!signal) continue

    if (prediction.createdAt >= recentStart) {
      signal.recentPredictionCount += 1
      signal.recentStake += prediction.amount
    } else {
      signal.previousPredictionCount += 1
      signal.previousStake += prediction.amount
    }
  }

  for (const ledger of ledgerRows) {
    const signal = signalForUser(ledger.userId)
    if (!signal) continue

    signal.recentLedgerCount += 1
    signal.recentLedgerAbsMovement += Math.abs(ledger.delta)

    if (ledger.delta > 0) {
      signal.recentLedgerPositive += ledger.delta
    } else {
      signal.recentLedgerNegative += Math.abs(ledger.delta)
    }

    if (ledger.type === 'prediction_liquidation') {
      signal.recentLiquidationCount += 1
    }
  }

  for (const withdrawal of withdrawalRows) {
    const signal = signalForUser(withdrawal.userId)
    if (!signal) continue

    if (withdrawal.requestedAt >= recentStart) {
      signal.recentWithdrawalAmount += withdrawal.amount
    }

    if (['pending', 'approved', 'submitted'].includes(withdrawal.status)) {
      signal.openWithdrawalAmount += withdrawal.amount
    }
  }

  for (const listing of listingRows) {
    const sellerSignal = signalForUser(listing.sellerId)
    if (sellerSignal) {
      sellerSignal.recentListingCount += 1
      sellerSignal.recentListingAmount += listing.price
    }

    if (listing.buyerId) {
      const buyerSignal = signalForUser(listing.buyerId)
      if (buyerSignal) {
        buyerSignal.recentListingCount += 1
        buyerSignal.recentListingAmount += listing.price
      }
    }
  }

  const alerts: AnomalyAlert[] = []

  for (const signal of signalMap.values()) {
    const previousDailyPredictionCount = signal.previousPredictionCount / BASELINE_DAYS
    const previousDailyStake = signal.previousStake / BASELINE_DAYS
    const predictionCountLift = previousDailyPredictionCount > 0
      ? signal.recentPredictionCount / previousDailyPredictionCount
      : signal.recentPredictionCount > 0 ? signal.recentPredictionCount : 0
    const stakeLift = previousDailyStake > 0
      ? signal.recentStake / previousDailyStake
      : signal.recentStake > 0 ? 4 : 0

    if (signal.recentPredictionCount >= 5 || signal.recentStake >= 50000 || predictionCountLift >= 4 || stakeLift >= 4) {
      const score = clamp(
        Math.round(
          signal.recentPredictionCount * 8
          + signal.recentStake / 1600
          + Math.max(0, predictionCountLift - 1) * 8
          + Math.max(0, stakeLift - 1) * 8
        ),
        0,
        100
      )

      pushAlert(alerts, createAlert({
        id: `prediction-velocity-${signal.user.id}`,
        type: 'prediction_velocity',
        title: '예측 참여 급증',
        score,
        userId: signal.user.id,
        userName: displayName(signal.user),
        userEmail: signal.user.email,
        userStatus: signal.user.status,
        amountDpmm: signal.recentStake,
        primaryMetric: formatCount(signal.recentPredictionCount),
        secondaryMetric: `${stakeLift.toFixed(1).replace(/\.0$/, '')}x stake`,
        targetPath: `/admin/users/${signal.user.id}`,
        reasons: [
          '최근 24시간 예측 참여량이 기준 구간 대비 높습니다',
          '짧은 시간에 DPMM 노출이 집중되었습니다',
        ],
        evidence: [
          { label: '최근 예측', value: formatCount(signal.recentPredictionCount) },
          { label: '최근 stake', value: formatDpmm(signal.recentStake) },
          { label: '기준 일평균 예측', value: previousDailyPredictionCount.toFixed(1).replace(/\.0$/, '') },
          { label: '기준 일평균 stake', value: formatDpmm(previousDailyStake) },
        ],
      }))
    }

    if (signal.recentLedgerCount >= 8 || signal.recentLedgerAbsMovement >= 100000 || signal.recentLiquidationCount >= 3) {
      const score = clamp(
        Math.round(
          signal.recentLedgerCount * 6
          + signal.recentLedgerAbsMovement / 2500
          + signal.recentLiquidationCount * 12
        ),
        0,
        100
      )

      pushAlert(alerts, createAlert({
        id: `ledger-velocity-${signal.user.id}`,
        type: 'ledger_velocity',
        title: 'DPMM 장부 변동 급증',
        score,
        userId: signal.user.id,
        userName: displayName(signal.user),
        userEmail: signal.user.email,
        userStatus: signal.user.status,
        amountDpmm: signal.recentLedgerAbsMovement,
        primaryMetric: formatDpmm(signal.recentLedgerAbsMovement),
        secondaryMetric: formatCount(signal.recentLedgerCount),
        targetPath: `/admin/users/${signal.user.id}`,
        reasons: [
          '최근 24시간 ledger transaction 수 또는 절대 변동액이 큽니다',
          '부분 청산이 반복된 경우 포지션 회전 여부를 확인해야 합니다',
        ],
        evidence: [
          { label: 'ledger 수', value: formatCount(signal.recentLedgerCount) },
          { label: '절대 변동액', value: formatDpmm(signal.recentLedgerAbsMovement) },
          { label: '유입', value: formatDpmm(signal.recentLedgerPositive) },
          { label: '유출', value: formatDpmm(signal.recentLedgerNegative) },
          { label: '부분 청산', value: formatCount(signal.recentLiquidationCount) },
        ],
      }))
    }

    if (signal.openWithdrawalAmount >= 20000 || signal.recentWithdrawalAmount >= 10000) {
      const balance = Math.max(1, signal.user.dpmmBalance)
      const openRatio = percentShare(signal.openWithdrawalAmount, balance + signal.openWithdrawalAmount)
      const score = clamp(
        Math.round(
          signal.openWithdrawalAmount / 1200
          + signal.recentWithdrawalAmount / 900
          + openRatio / 2
        ),
        0,
        100
      )

      pushAlert(alerts, createAlert({
        id: `withdrawal-pressure-${signal.user.id}`,
        type: 'withdrawal_pressure',
        title: '출금 요청 압력',
        score,
        userId: signal.user.id,
        userName: displayName(signal.user),
        userEmail: signal.user.email,
        userStatus: signal.user.status,
        amountDpmm: signal.openWithdrawalAmount,
        primaryMetric: formatDpmm(signal.openWithdrawalAmount),
        secondaryMetric: `${Math.round(openRatio)}% exposure`,
        targetPath: `/admin/users/${signal.user.id}`,
        reasons: [
          '검토/승인/전송 중인 출금 요청 규모가 큽니다',
          '최근 유입과 출금 요청이 겹치는지 수동 확인이 필요합니다',
        ],
        evidence: [
          { label: '열린 출금', value: formatDpmm(signal.openWithdrawalAmount) },
          { label: '최근 출금 요청', value: formatDpmm(signal.recentWithdrawalAmount) },
          { label: '현재 장부 잔액', value: formatDpmm(signal.user.dpmmBalance) },
          { label: '최근 유입', value: formatDpmm(signal.recentLedgerPositive) },
        ],
      }))
    }

    if (signal.recentListingCount >= 3 || signal.recentListingAmount >= 30000) {
      const score = clamp(
        Math.round(signal.recentListingCount * 12 + signal.recentListingAmount / 1200),
        0,
        100
      )

      pushAlert(alerts, createAlert({
        id: `position-transfer-${signal.user.id}`,
        type: 'position_transfer_velocity',
        title: '포지션 거래 회전 증가',
        score,
        userId: signal.user.id,
        userName: displayName(signal.user),
        userEmail: signal.user.email,
        userStatus: signal.user.status,
        amountDpmm: signal.recentListingAmount,
        primaryMetric: formatCount(signal.recentListingCount),
        secondaryMetric: formatDpmm(signal.recentListingAmount),
        targetPath: `/admin/users/${signal.user.id}`,
        reasons: [
          '최근 24시간 포지션 매도/매수 관련 활동이 집중되었습니다',
          '동일 계정 또는 소수 계정 사이의 반복 거래 여부를 확인해야 합니다',
        ],
        evidence: [
          { label: '거래 활동', value: formatCount(signal.recentListingCount) },
          { label: '가격 합계', value: formatDpmm(signal.recentListingAmount) },
          { label: 'ledger 변동액', value: formatDpmm(signal.recentLedgerAbsMovement) },
        ],
      }))
    }
  }

  for (const market of marketRows) {
    if (market.hidden || market.predictions.length < 2) continue

    const totalStake = market.predictions.reduce((sum, prediction) => sum + prediction.amount, 0)
    if (totalStake < 10000) continue

    const userStakeMap = new Map<string, number>()
    for (const prediction of market.predictions) {
      if (!userMap.has(prediction.userId)) continue
      userStakeMap.set(prediction.userId, (userStakeMap.get(prediction.userId) || 0) + prediction.amount)
    }

    for (const [userId, stake] of userStakeMap.entries()) {
      const user = userMap.get(userId)
      if (!user) continue

      const share = percentShare(stake, totalStake)
      if (share < 70 && stake < 50000) continue

      const score = clamp(
        Math.round(share + stake / 2500 + (market.predictions.length <= 3 ? 10 : 0)),
        0,
        100
      )

      pushAlert(alerts, createAlert({
        id: `market-concentration-${market.id}-${user.id}`,
        type: 'market_concentration',
        title: '마켓 stake 집중',
        score,
        userId: user.id,
        userName: displayName(user),
        userEmail: user.email,
        userStatus: user.status,
        amountDpmm: stake,
        primaryMetric: `${Math.round(share)}% share`,
        secondaryMetric: formatDpmm(stake),
        targetPath: `/markets/${market.id}`,
        reasons: [
          '특정 사용자의 stake가 한 마켓에 과도하게 집중되었습니다',
          '시장 가격 왜곡 또는 소수 계정 집중 참여 여부를 확인해야 합니다',
        ],
        evidence: [
          { label: '마켓', value: market.title },
          { label: '사용자 stake', value: formatDpmm(stake) },
          { label: '전체 stake', value: formatDpmm(totalStake) },
          { label: '점유율', value: `${Math.round(share)}%` },
          { label: '참여 수', value: formatCount(market.predictions.length) },
        ],
      }))
    }
  }

  const sortedAlerts = alerts
    .sort((left, right) => (
      right.score - left.score
      || right.amountDpmm - left.amountDpmm
      || left.title.localeCompare(right.title)
    ))
    .slice(0, 50)

  return {
    modelVersion: 'local-anomaly-detector-v1',
    generatedAt: now,
    windowHours: RECENT_WINDOW_HOURS,
    baselineDays: BASELINE_DAYS,
    recentStart,
    baselineStart,
    totalAlerts: sortedAlerts.length,
    criticalAlerts: sortedAlerts.filter((alert) => alert.severity === 'critical').length,
    highAlerts: sortedAlerts.filter((alert) => alert.severity === 'high').length,
    mediumAlerts: sortedAlerts.filter((alert) => alert.severity === 'medium').length,
    watchedUsers: signalMap.size,
    totalRecentStake: Array.from(signalMap.values()).reduce((sum, signal) => sum + signal.recentStake, 0),
    totalRecentLedgerMovement: Array.from(signalMap.values()).reduce((sum, signal) => sum + signal.recentLedgerAbsMovement, 0),
    openWithdrawalAmount: Array.from(signalMap.values()).reduce((sum, signal) => sum + signal.openWithdrawalAmount, 0),
    alerts: sortedAlerts,
  }
}
