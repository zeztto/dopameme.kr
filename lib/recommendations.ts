import { prisma } from '@/lib/db'
import { computeAmmOptionProbabilities } from '@/lib/markets/amm'

type Tone = 'primary' | 'secondary' | 'success' | 'warning'

type ScoreBreakdown = {
  category: number
  momentum: number
  confidence: number
  timing: number
  novelty: number
}

type UserCategoryProfile = {
  category: string
  predictionCount: number
  stakeAmount: number
  winRate: number
}

export type RecommendationOption = {
  id: string
  title: string
  probability: number
  totalAmount: number
  totalPredictions: number
}

export type PredictionRecommendation = {
  marketId: string
  title: string
  description: string
  category: string
  endsAt: Date
  createdAt: Date
  totalAmount: number
  participantCount: number
  commentCount: number
  score: number
  scoreBreakdown: ScoreBreakdown
  riskLevel: 'low' | 'medium' | 'high'
  riskLabel: string
  suggestedStake: number
  suggestedOption: RecommendationOption
  options: RecommendationOption[]
  reasons: string[]
  signalTone: Tone
}

export type PredictionRecommendationOverview = {
  balance: number
  modelVersion: string
  recommendedCount: number
  skippedPredictedMarkets: number
  topCategories: UserCategoryProfile[]
  recommendations: PredictionRecommendation[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function daysUntil(date: Date, now = new Date()) {
  return Math.max(0, (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function buildSuggestedStake(balance: number, riskLevel: PredictionRecommendation['riskLevel']) {
  if (balance < 100) return 0

  const riskMultiplier = riskLevel === 'low' ? 0.06 : riskLevel === 'medium' ? 0.04 : 0.025
  const rawStake = Math.floor((balance * riskMultiplier) / 100) * 100
  return clamp(rawStake, 100, 1000)
}

function riskForRecommendation(input: {
  probability: number
  totalAmount: number
  participantCount: number
  daysLeft: number
}): Pick<PredictionRecommendation, 'riskLevel' | 'riskLabel' | 'signalTone'> {
  if (input.probability >= 65 && input.totalAmount >= 5000 && input.participantCount >= 5) {
    return {
      riskLevel: 'low',
      riskLabel: '낮음',
      signalTone: 'success',
    }
  }

  if (input.probability < 52 || input.totalAmount < 1000 || input.daysLeft < 1) {
    return {
      riskLevel: 'high',
      riskLabel: '높음',
      signalTone: 'warning',
    }
  }

  return {
    riskLevel: 'medium',
    riskLabel: '보통',
    signalTone: 'primary',
  }
}

function buildUserCategoryProfiles(predictions: Array<{
  amount: number
  payout: number
  resolved: number
  market: { category: string }
}>) {
  const categoryMap = new Map<string, {
    category: string
    predictionCount: number
    stakeAmount: number
    wins: number
    losses: number
  }>()

  for (const prediction of predictions) {
    const category = prediction.market.category || '기타'
    const row = categoryMap.get(category) || {
      category,
      predictionCount: 0,
      stakeAmount: 0,
      wins: 0,
      losses: 0,
    }

    row.predictionCount += 1
    row.stakeAmount += prediction.amount
    if (prediction.resolved === 1) row.wins += 1
    if (prediction.resolved === -1) row.losses += 1
    categoryMap.set(category, row)
  }

  return Array.from(categoryMap.values())
    .map((row) => {
      const resolvedCount = row.wins + row.losses
      const winRate = resolvedCount > 0 ? Math.round((row.wins / resolvedCount) * 100) : 0

      return {
        category: row.category,
        predictionCount: row.predictionCount,
        stakeAmount: row.stakeAmount,
        winRate,
      }
    })
    .sort((left, right) => (
      right.predictionCount - left.predictionCount
      || right.stakeAmount - left.stakeAmount
      || right.winRate - left.winRate
    ))
}

function categoryAffinityScore(category: string, profiles: UserCategoryProfile[]) {
  const profile = profiles.find((row) => row.category === category)
  if (!profile) return profiles.length === 0 ? 18 : 8

  const countScore = clamp(profile.predictionCount * 4, 0, 18)
  const stakeScore = clamp(Math.floor(profile.stakeAmount / 1000), 0, 6)
  const winScore = profile.winRate >= 60 ? 6 : profile.winRate >= 45 ? 3 : 0
  return clamp(countScore + stakeScore + winScore, 0, 30)
}

function buildReasons(input: {
  categoryScore: number
  momentumScore: number
  confidenceScore: number
  timingScore: number
  noveltyScore: number
  category: string
  suggestedOptionTitle: string
  probability: number
  daysLeft: number
}) {
  const reasons: string[] = []

  if (input.categoryScore >= 18) {
    reasons.push(`${input.category} 카테고리와 기존 활동이 맞습니다`)
  } else if (input.noveltyScore >= 8) {
    reasons.push('아직 덜 탐색한 카테고리라 포트폴리오 분산에 유리합니다')
  }

  if (input.momentumScore >= 18) {
    reasons.push('참여량과 댓글 신호가 강합니다')
  }

  if (input.confidenceScore >= 14) {
    reasons.push(`${input.suggestedOptionTitle} 선택지가 ${input.probability}%로 앞서 있습니다`)
  } else {
    reasons.push('확률 차이가 크지 않아 변동성이 있습니다')
  }

  if (input.timingScore >= 10) {
    reasons.push(`마감까지 ${Math.ceil(input.daysLeft)}일 남아 판단 시간이 적절합니다`)
  }

  return reasons.slice(0, 4)
}

export async function getPredictionRecommendations(userId: string): Promise<PredictionRecommendationOverview> {
  const now = new Date()

  const [user, userPredictions, candidateMarkets, skippedPredictedMarkets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { dpmmBalance: true },
    }),
    prisma.prediction.findMany({
      where: { userId },
      select: {
        amount: true,
        payout: true,
        resolved: true,
        marketId: true,
        market: {
          select: {
            category: true,
          },
        },
      },
    }),
    prisma.market.findMany({
      where: {
        status: 'active',
        hidden: false,
        endsAt: { gt: now },
        predictions: {
          none: { userId },
        },
      },
      take: 40,
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        endsAt: true,
        createdAt: true,
        options: {
          select: {
            id: true,
            title: true,
            totalAmount: true,
            totalPredictions: true,
          },
        },
        ammConfig: {
          select: {
            enabled: true,
            virtualLiquidity: true,
          },
        },
        _count: {
          select: {
            predictions: true,
            comments: true,
          },
        },
      },
    }),
    prisma.market.count({
      where: {
        status: 'active',
        hidden: false,
        endsAt: { gt: now },
        predictions: {
          some: { userId },
        },
      },
    }),
  ])

  const balance = user?.dpmmBalance ?? 0
  const topCategories = buildUserCategoryProfiles(userPredictions).slice(0, 5)

  const recommendations = candidateMarkets
    .map((market): PredictionRecommendation | null => {
      const optionsWithProbabilities = computeAmmOptionProbabilities(market.options, market.ammConfig)
        .map((option) => ({
          id: option.id,
          title: option.title,
          probability: option.percentage,
          totalAmount: option.totalAmount,
          totalPredictions: option.totalPredictions,
        }))
        .sort((left, right) => (
          right.probability - left.probability
          || right.totalAmount - left.totalAmount
          || right.totalPredictions - left.totalPredictions
        ))

      const suggestedOption = optionsWithProbabilities[0]
      if (!suggestedOption) return null

      const totalAmount = market.options.reduce((sum, option) => sum + option.totalAmount, 0)
      const participantCount = market._count.predictions
      const commentCount = market._count.comments
      const daysLeft = daysUntil(market.endsAt, now)

      const categoryScore = categoryAffinityScore(market.category, topCategories)
      const momentumScore = clamp(
        Math.round(Math.log10(totalAmount + 1) * 5)
        + Math.min(8, participantCount)
        + Math.min(5, commentCount),
        0,
        25
      )
      const confidenceScore = clamp(Math.round((suggestedOption.probability - 35) * 0.6), 0, 20)
      const timingScore = daysLeft <= 0
        ? 0
        : daysLeft <= 3
          ? 15
          : daysLeft <= 14
            ? 12
            : daysLeft <= 30
              ? 8
              : 4
      const noveltyScore = topCategories.some((row) => row.category === market.category) ? 3 : 10
      const scoreBreakdown = {
        category: categoryScore,
        momentum: momentumScore,
        confidence: confidenceScore,
        timing: timingScore,
        novelty: noveltyScore,
      }
      const score = clamp(
        categoryScore + momentumScore + confidenceScore + timingScore + noveltyScore,
        0,
        100
      )
      const risk = riskForRecommendation({
        probability: suggestedOption.probability,
        totalAmount,
        participantCount,
        daysLeft,
      })

      return {
        marketId: market.id,
        title: market.title,
        description: market.description,
        category: market.category,
        endsAt: market.endsAt,
        createdAt: market.createdAt,
        totalAmount,
        participantCount,
        commentCount,
        score,
        scoreBreakdown,
        ...risk,
        suggestedStake: buildSuggestedStake(balance, risk.riskLevel),
        suggestedOption,
        options: optionsWithProbabilities,
        reasons: buildReasons({
          categoryScore,
          momentumScore,
          confidenceScore,
          timingScore,
          noveltyScore,
          category: market.category,
          suggestedOptionTitle: suggestedOption.title,
          probability: suggestedOption.probability,
          daysLeft,
        }),
      }
    })
    .filter((recommendation): recommendation is PredictionRecommendation => Boolean(recommendation))
    .sort((left, right) => (
      right.score - left.score
      || right.totalAmount - left.totalAmount
      || left.endsAt.getTime() - right.endsAt.getTime()
    ))
    .slice(0, 8)

  return {
    balance,
    modelVersion: 'local-recommendation-v1',
    recommendedCount: recommendations.length,
    skippedPredictedMarkets,
    topCategories,
    recommendations,
  }
}
