import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export type AchievementCode =
  | 'first_prediction'
  | 'prediction_rookie'
  | 'prediction_regular'
  | 'first_win'
  | 'win_streak_3'
  | 'win_streak_10'
  | 'profit_10k'
  | 'profit_50k'
  | 'stake_100k'
  | 'comment_starter'
  | 'social_starter'

type AchievementCatalogItem = {
  code: AchievementCode
  title: string
  description: string
  category: string
  icon: string
  threshold: number
  rewardDpmm: number
  sortOrder: number
}

type AchievementMetrics = {
  totalPredictions: number
  totalWins: number
  longestWinStreak: number
  settledNetProfit: number
  totalStake: number
  totalComments: number
  followingCount: number
}

type AchievementDefinitionLike = {
  id: string
  code: string
  title: string
  description: string
  category: string
  icon: string
  threshold: number
  rewardDpmm: number
  sortOrder: number
}

type UserAchievementLike = {
  achievementId: string
  progress: number
  unlockedAt: Date | null
}

export type AchievementOverviewItem = {
  id: string
  code: string
  title: string
  description: string
  category: string
  icon: string
  threshold: number
  rewardDpmm: number
  progress: number
  progressPercent: number
  unlockedAt: Date | null
}

export type AchievementOverview = {
  totalCount: number
  unlockedCount: number
  completionRate: number
  categories: {
    category: string
    totalCount: number
    unlockedCount: number
  }[]
  achievements: AchievementOverviewItem[]
  nextAchievements: AchievementOverviewItem[]
}

export const ACHIEVEMENT_CATALOG: AchievementCatalogItem[] = [
  {
    code: 'first_prediction',
    title: '첫 예측',
    description: '첫 번째 예측 포지션을 만들었습니다.',
    category: 'prediction',
    icon: 'FIRST',
    threshold: 1,
    rewardDpmm: 0,
    sortOrder: 10,
  },
  {
    code: 'prediction_rookie',
    title: '예측 루키',
    description: '예측 시장에 10번 참여했습니다.',
    category: 'prediction',
    icon: 'TEN',
    threshold: 10,
    rewardDpmm: 0,
    sortOrder: 20,
  },
  {
    code: 'prediction_regular',
    title: '상시 참여자',
    description: '예측 시장에 50번 참여했습니다.',
    category: 'prediction',
    icon: 'FIFTY',
    threshold: 50,
    rewardDpmm: 0,
    sortOrder: 30,
  },
  {
    code: 'first_win',
    title: '첫 적중',
    description: '정산된 마켓에서 첫 승리를 기록했습니다.',
    category: 'accuracy',
    icon: 'WIN',
    threshold: 1,
    rewardDpmm: 0,
    sortOrder: 40,
  },
  {
    code: 'win_streak_3',
    title: '3연승',
    description: '정산된 예측에서 3연속 적중을 달성했습니다.',
    category: 'accuracy',
    icon: '3X',
    threshold: 3,
    rewardDpmm: 0,
    sortOrder: 50,
  },
  {
    code: 'win_streak_10',
    title: '10연승',
    description: '정산된 예측에서 10연속 적중을 달성했습니다.',
    category: 'accuracy',
    icon: '10X',
    threshold: 10,
    rewardDpmm: 0,
    sortOrder: 60,
  },
  {
    code: 'profit_10k',
    title: '수익 1만 DPMM',
    description: '정산 손익이 누적 10,000 DPMM을 넘었습니다.',
    category: 'profit',
    icon: '10K',
    threshold: 10000,
    rewardDpmm: 0,
    sortOrder: 70,
  },
  {
    code: 'profit_50k',
    title: '수익 5만 DPMM',
    description: '정산 손익이 누적 50,000 DPMM을 넘었습니다.',
    category: 'profit',
    icon: '50K',
    threshold: 50000,
    rewardDpmm: 0,
    sortOrder: 80,
  },
  {
    code: 'stake_100k',
    title: '참여 10만 DPMM',
    description: '예측에 누적 100,000 DPMM을 사용했습니다.',
    category: 'volume',
    icon: 'VOL',
    threshold: 100000,
    rewardDpmm: 0,
    sortOrder: 90,
  },
  {
    code: 'comment_starter',
    title: '첫 토론',
    description: '마켓 토론에 첫 댓글을 남겼습니다.',
    category: 'community',
    icon: 'TALK',
    threshold: 1,
    rewardDpmm: 0,
    sortOrder: 100,
  },
  {
    code: 'social_starter',
    title: '첫 팔로우',
    description: '다른 사용자를 처음 팔로우했습니다.',
    category: 'community',
    icon: 'LINK',
    threshold: 1,
    rewardDpmm: 0,
    sortOrder: 110,
  },
]

function achievementProgress(code: string, metrics: AchievementMetrics) {
  if (code === 'first_prediction') return metrics.totalPredictions
  if (code === 'prediction_rookie') return metrics.totalPredictions
  if (code === 'prediction_regular') return metrics.totalPredictions
  if (code === 'first_win') return metrics.totalWins
  if (code === 'win_streak_3') return metrics.longestWinStreak
  if (code === 'win_streak_10') return metrics.longestWinStreak
  if (code === 'profit_10k') return Math.max(0, metrics.settledNetProfit)
  if (code === 'profit_50k') return Math.max(0, metrics.settledNetProfit)
  if (code === 'stake_100k') return metrics.totalStake
  if (code === 'comment_starter') return metrics.totalComments
  if (code === 'social_starter') return metrics.followingCount
  return 0
}

function calculateLongestWinStreak(predictions: { resolved: number; createdAt: Date }[]) {
  let current = 0
  let longest = 0

  for (const prediction of predictions) {
    if (prediction.resolved === 1) {
      current += 1
      longest = Math.max(longest, current)
      continue
    }

    if (prediction.resolved === -1) {
      current = 0
    }
  }

  return longest
}

function buildAchievementOverview(
  definitions: AchievementDefinitionLike[],
  userAchievements: UserAchievementLike[]
): AchievementOverview {
  const userAchievementMap = new Map(
    userAchievements.map((achievement) => [achievement.achievementId, achievement])
  )

  const achievements = definitions.map((definition) => {
    const userAchievement = userAchievementMap.get(definition.id)
    const progress = userAchievement?.progress || 0
    const progressPercent = definition.threshold > 0
      ? Math.min(100, Math.round((progress / definition.threshold) * 100))
      : 0

    return {
      id: definition.id,
      code: definition.code,
      title: definition.title,
      description: definition.description,
      category: definition.category,
      icon: definition.icon,
      threshold: definition.threshold,
      rewardDpmm: definition.rewardDpmm,
      progress,
      progressPercent,
      unlockedAt: userAchievement?.unlockedAt || null,
    }
  })

  const categoryMap = new Map<string, { category: string; totalCount: number; unlockedCount: number }>()
  for (const achievement of achievements) {
    const row = categoryMap.get(achievement.category) || {
      category: achievement.category,
      totalCount: 0,
      unlockedCount: 0,
    }
    row.totalCount += 1
    if (achievement.unlockedAt) row.unlockedCount += 1
    categoryMap.set(achievement.category, row)
  }

  const unlockedCount = achievements.filter((achievement) => achievement.unlockedAt).length

  return {
    totalCount: achievements.length,
    unlockedCount,
    completionRate: achievements.length > 0
      ? Math.round((unlockedCount / achievements.length) * 100)
      : 0,
    categories: Array.from(categoryMap.values()),
    achievements,
    nextAchievements: achievements
      .filter((achievement) => !achievement.unlockedAt)
      .sort((left, right) => right.progressPercent - left.progressPercent || left.threshold - right.threshold)
      .slice(0, 3),
  }
}

export async function syncAchievementDefinitions(client: Prisma.TransactionClient | typeof prisma = prisma) {
  for (const achievement of ACHIEVEMENT_CATALOG) {
    await client.achievementDefinition.upsert({
      where: { code: achievement.code },
      update: {
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        threshold: achievement.threshold,
        rewardDpmm: achievement.rewardDpmm,
        isActive: true,
        sortOrder: achievement.sortOrder,
      },
      create: {
        code: achievement.code,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        threshold: achievement.threshold,
        rewardDpmm: achievement.rewardDpmm,
        isActive: true,
        sortOrder: achievement.sortOrder,
      },
    })
  }
}

export async function getAchievementMetrics(userId: string, client: Prisma.TransactionClient | typeof prisma = prisma) {
  const [predictions, commentCount, followingCount] = await Promise.all([
    client.prediction.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        amount: true,
        payout: true,
        resolved: true,
        createdAt: true,
      },
    }),
    client.marketComment.count({ where: { userId, status: 'visible' } }),
    client.userFollow.count({ where: { followerId: userId } }),
  ])

  const resolvedPredictions = predictions.filter((prediction) => prediction.resolved !== 0)
  const totalStake = predictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const resolvedStake = resolvedPredictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const totalPayout = resolvedPredictions.reduce((sum, prediction) => sum + prediction.payout, 0)

  return {
    totalPredictions: predictions.length,
    totalWins: resolvedPredictions.filter((prediction) => prediction.resolved === 1).length,
    longestWinStreak: calculateLongestWinStreak(resolvedPredictions),
    settledNetProfit: totalPayout - resolvedStake,
    totalStake,
    totalComments: commentCount,
    followingCount,
  }
}

export async function evaluateUserAchievements(userId: string): Promise<AchievementOverview> {
  return prisma.$transaction(async (tx) => {
    await syncAchievementDefinitions(tx)

    const [definitions, metrics] = await Promise.all([
      tx.achievementDefinition.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
          category: true,
          icon: true,
          threshold: true,
          rewardDpmm: true,
          sortOrder: true,
        },
      }),
      getAchievementMetrics(userId, tx),
    ])

    const existingAchievements = await tx.userAchievement.findMany({
      where: { userId },
      select: {
        achievementId: true,
        progress: true,
        unlockedAt: true,
      },
    })
    const existingMap = new Map(
      existingAchievements.map((achievement) => [achievement.achievementId, achievement])
    )

    const now = new Date()
    await Promise.all(definitions.map((definition) => {
      const progress = achievementProgress(definition.code, metrics)
      const existing = existingMap.get(definition.id)
      const shouldUnlock = progress >= definition.threshold

      return tx.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: definition.id,
          },
        },
        update: {
          progress,
          unlockedAt: shouldUnlock ? (existing?.unlockedAt || now) : existing?.unlockedAt || null,
        },
        create: {
          userId,
          achievementId: definition.id,
          progress,
          unlockedAt: shouldUnlock ? now : null,
        },
      })
    }))

    const userAchievements = await tx.userAchievement.findMany({
      where: { userId },
      select: {
        achievementId: true,
        progress: true,
        unlockedAt: true,
      },
    })

    return buildAchievementOverview(definitions, userAchievements)
  })
}
