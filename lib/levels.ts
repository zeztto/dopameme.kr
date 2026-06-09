import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { createDpmmLedgerEntry } from '@/lib/dpmm/ledger'

type LevelDefinitionCatalogItem = {
  level: number
  title: string
  minXp: number
  rewardDpmm: number
}

type LevelDefinitionLike = LevelDefinitionCatalogItem & {
  id: string
}

type UserLevelSnapshot = {
  xp: number
  level: number
  rewardedLevel: number
  lastCalculatedAt: Date
}

export type XpSource = {
  key: string
  label: string
  value: number
  helper: string
}

export type UserLevelOverview = {
  xp: number
  level: number
  title: string
  rewardedLevel: number
  nextLevel: number | null
  nextTitle: string | null
  nextLevelMinXp: number | null
  currentLevelMinXp: number
  progressInLevel: number
  requiredForNextLevel: number
  progressPercent: number
  claimableRewardDpmm: number
  claimableRewardLevels: number[]
  maxDefinedLevel: number
  lastCalculatedAt: Date
  sources: XpSource[]
  definitions: LevelDefinitionLike[]
}

export const LEVEL_DEFINITIONS: LevelDefinitionCatalogItem[] = [
  { level: 1, title: '루키', minXp: 0, rewardDpmm: 0 },
  { level: 2, title: '입문 예측가', minXp: 500, rewardDpmm: 100 },
  { level: 3, title: '시장 관찰자', minXp: 1500, rewardDpmm: 150 },
  { level: 4, title: '확률 분석가', minXp: 3000, rewardDpmm: 250 },
  { level: 5, title: '정규 플레이어', minXp: 5000, rewardDpmm: 500 },
  { level: 6, title: '숙련 예측가', minXp: 8000, rewardDpmm: 750 },
  { level: 7, title: '마켓 메이커', minXp: 12000, rewardDpmm: 1000 },
  { level: 8, title: '시그널 헌터', minXp: 17000, rewardDpmm: 1250 },
  { level: 9, title: '도파민 전략가', minXp: 23000, rewardDpmm: 1500 },
  { level: 10, title: '도파밈 마스터', minXp: 30000, rewardDpmm: 2000 },
]

function activeDefinitions(definitions: LevelDefinitionLike[]) {
  return definitions.sort((left, right) => left.level - right.level)
}

function currentDefinitionForXp(definitions: LevelDefinitionLike[], xp: number) {
  return activeDefinitions(definitions).reduce((current, definition) => (
    definition.minXp <= xp && definition.level >= current.level ? definition : current
  ), definitions[0])
}

function nextDefinitionForLevel(definitions: LevelDefinitionLike[], level: number) {
  return activeDefinitions(definitions).find((definition) => definition.level > level) || null
}

function buildOverview(
  definitions: LevelDefinitionLike[],
  snapshot: UserLevelSnapshot,
  sources: XpSource[]
): UserLevelOverview {
  const currentDefinition = definitions.find((definition) => definition.level === snapshot.level)
    || currentDefinitionForXp(definitions, snapshot.xp)
  const nextDefinition = nextDefinitionForLevel(definitions, currentDefinition.level)
  const currentLevelMinXp = currentDefinition.minXp
  const nextLevelMinXp = nextDefinition?.minXp ?? null
  const requiredForNextLevel = nextLevelMinXp === null
    ? 0
    : Math.max(1, nextLevelMinXp - currentLevelMinXp)
  const progressInLevel = nextLevelMinXp === null
    ? 0
    : Math.max(0, snapshot.xp - currentLevelMinXp)
  const progressPercent = nextLevelMinXp === null
    ? 100
    : Math.min(100, Math.round((progressInLevel / requiredForNextLevel) * 100))
  const claimableRewardLevels = definitions
    .filter((definition) => (
      definition.level > snapshot.rewardedLevel
      && definition.level <= snapshot.level
      && definition.rewardDpmm > 0
    ))
    .map((definition) => definition.level)
  const claimableRewardDpmm = definitions
    .filter((definition) => claimableRewardLevels.includes(definition.level))
    .reduce((sum, definition) => sum + definition.rewardDpmm, 0)

  return {
    xp: snapshot.xp,
    level: snapshot.level,
    title: currentDefinition.title,
    rewardedLevel: snapshot.rewardedLevel,
    nextLevel: nextDefinition?.level ?? null,
    nextTitle: nextDefinition?.title ?? null,
    nextLevelMinXp,
    currentLevelMinXp,
    progressInLevel,
    requiredForNextLevel,
    progressPercent,
    claimableRewardDpmm,
    claimableRewardLevels,
    maxDefinedLevel: Math.max(...definitions.map((definition) => definition.level)),
    lastCalculatedAt: snapshot.lastCalculatedAt,
    sources,
    definitions,
  }
}

async function calculateXpSources(userId: string, client: Prisma.TransactionClient | typeof prisma = prisma) {
  const predictions = await client.prediction.findMany({
    where: { userId },
    select: {
      amount: true,
      payout: true,
      resolved: true,
    },
  })
  const visibleCommentCount = await client.marketComment.count({ where: { userId, status: 'visible' } })
  const followingCount = await client.userFollow.count({ where: { followerId: userId } })
  const unlockedAchievementCount = await client.userAchievement.count({
    where: {
      userId,
      unlockedAt: { not: null },
    },
  })

  const resolvedPredictions = predictions.filter((prediction) => prediction.resolved !== 0)
  const winCount = resolvedPredictions.filter((prediction) => prediction.resolved === 1).length
  const totalStake = predictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const settledStake = resolvedPredictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const settledPayout = resolvedPredictions.reduce((sum, prediction) => sum + prediction.payout, 0)
  const settledNet = settledPayout - settledStake

  const sources: XpSource[] = [
    {
      key: 'prediction_count',
      label: '예측 참여',
      value: predictions.length * 100,
      helper: `${predictions.length.toLocaleString()}회 × 100 XP`,
    },
    {
      key: 'wins',
      label: '적중 보너스',
      value: winCount * 250,
      helper: `${winCount.toLocaleString()}승 × 250 XP`,
    },
    {
      key: 'stake_volume',
      label: '참여량',
      value: Math.floor(totalStake / 100),
      helper: `${totalStake.toLocaleString()} DPMM / 100`,
    },
    {
      key: 'profit',
      label: '정산 수익',
      value: Math.floor(Math.max(0, settledNet) / 50),
      helper: `${Math.max(0, settledNet).toLocaleString()} DPMM / 50`,
    },
    {
      key: 'comments',
      label: '토론 참여',
      value: visibleCommentCount * 50,
      helper: `${visibleCommentCount.toLocaleString()}개 댓글 × 50 XP`,
    },
    {
      key: 'social',
      label: '팔로우',
      value: followingCount * 75,
      helper: `${followingCount.toLocaleString()}명 × 75 XP`,
    },
    {
      key: 'achievements',
      label: '업적 달성',
      value: unlockedAchievementCount * 150,
      helper: `${unlockedAchievementCount.toLocaleString()}개 × 150 XP`,
    },
  ]

  return sources
}

export async function syncLevelDefinitions(client: Prisma.TransactionClient | typeof prisma = prisma) {
  for (const definition of LEVEL_DEFINITIONS) {
    await client.levelDefinition.upsert({
      where: { level: definition.level },
      update: {
        title: definition.title,
        minXp: definition.minXp,
        rewardDpmm: definition.rewardDpmm,
        isActive: true,
      },
      create: {
        level: definition.level,
        title: definition.title,
        minXp: definition.minXp,
        rewardDpmm: definition.rewardDpmm,
        isActive: true,
      },
    })
  }
}

export async function evaluateUserLevel(
  userId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma
): Promise<UserLevelOverview> {
  await syncLevelDefinitions(client)

  const definitions = await client.levelDefinition.findMany({
    where: { isActive: true },
    orderBy: { level: 'asc' },
    select: {
      id: true,
      level: true,
      title: true,
      minXp: true,
      rewardDpmm: true,
    },
  })
  const sources = await calculateXpSources(userId, client)
  const existingSnapshot = await client.userLevel.findUnique({
    where: { userId },
    select: {
      xp: true,
      level: true,
      rewardedLevel: true,
      lastCalculatedAt: true,
    },
  })

  if (definitions.length === 0) {
    throw new Error('No active level definitions are configured')
  }

  const calculatedXp = sources.reduce((sum, source) => sum + source.value, 0)
  const xp = Math.max(calculatedXp, existingSnapshot?.xp ?? 0)
  const calculatedLevel = currentDefinitionForXp(definitions, xp).level
  const level = Math.max(calculatedLevel, existingSnapshot?.level ?? 1)
  const rewardedLevel = Math.max(1, existingSnapshot?.rewardedLevel ?? 1)
  const lastCalculatedAt = new Date()

  const snapshot = await client.userLevel.upsert({
    where: { userId },
    update: {
      xp,
      level,
      lastCalculatedAt,
    },
    create: {
      userId,
      xp,
      level,
      rewardedLevel,
      lastCalculatedAt,
    },
    select: {
      xp: true,
      level: true,
      rewardedLevel: true,
      lastCalculatedAt: true,
    },
  })

  return buildOverview(definitions, snapshot, sources)
}

export async function claimLevelRewards(userId: string) {
  return prisma.$transaction(async (tx) => {
    const overview = await evaluateUserLevel(userId, tx)

    if (overview.claimableRewardDpmm <= 0) {
      return {
        claimedDpmm: 0,
        overview,
      }
    }

    const currentSnapshot = await tx.userLevel.findUnique({
      where: { userId },
      select: {
        rewardedLevel: true,
      },
    })

    if (!currentSnapshot) {
      return {
        claimedDpmm: 0,
        overview,
      }
    }

    const updatedSnapshot = await tx.userLevel.updateMany({
      where: {
        userId,
        rewardedLevel: currentSnapshot.rewardedLevel,
      },
      data: {
        rewardedLevel: overview.level,
      },
    })

    if (updatedSnapshot.count !== 1) {
      return {
        claimedDpmm: 0,
        overview: await evaluateUserLevel(userId, tx),
      }
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        dpmmBalance: {
          increment: overview.claimableRewardDpmm,
        },
      },
      select: {
        dpmmBalance: true,
      },
    })

    await createDpmmLedgerEntry(tx, {
      userId,
      type: 'level_reward',
      delta: overview.claimableRewardDpmm,
      balanceAfter: updatedUser.dpmmBalance,
      reason: `Level ${currentSnapshot.rewardedLevel + 1}-${overview.level} reward`,
      sourceType: 'user_level',
      sourceId: `${userId}:${currentSnapshot.rewardedLevel + 1}-${overview.level}`,
    })

    return {
      claimedDpmm: overview.claimableRewardDpmm,
      overview: await evaluateUserLevel(userId, tx),
    }
  })
}
