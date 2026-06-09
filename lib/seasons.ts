import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

type SeasonType = 'monthly' | 'quarterly'

type SeasonWindow = {
  code: string
  title: string
  description: string
  type: SeasonType
  startsAt: Date
  endsAt: Date
  rewardDpmm: number
  sortOrder: number
}

type SeasonEventLike = {
  id: string
  code: string
  title: string
  description: string
  type: string
  startsAt: Date
  endsAt: Date
  rewardDpmm: number
  sortOrder: number
}

type UserSeasonProgressLike = {
  userId: string
  score: number
  predictionCount: number
  winCount: number
  stakeAmount: number
  profitAmount: number
  commentCount: number
  lastCalculatedAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export type SeasonLeaderboardRow = {
  rank: number
  userId: string
  name: string
  image: string | null
  score: number
  predictionCount: number
  winCount: number
  stakeAmount: number
  profitAmount: number
  commentCount: number
  isCurrentUser: boolean
}

export type SeasonOverviewItem = {
  id: string
  code: string
  title: string
  description: string
  type: string
  startsAt: Date
  endsAt: Date
  rewardDpmm: number
  myRank: number | null
  myProgress: {
    score: number
    predictionCount: number
    winCount: number
    stakeAmount: number
    profitAmount: number
    commentCount: number
    lastCalculatedAt: Date
  }
  leaderboard: SeasonLeaderboardRow[]
}

export type SeasonEventsOverview = {
  activeSeasons: SeasonOverviewItem[]
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function startOfNextMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
}

function startOfQuarter(date: Date) {
  const quarterStartMonth = Math.floor(date.getUTCMonth() / 3) * 3
  return new Date(Date.UTC(date.getUTCFullYear(), quarterStartMonth, 1))
}

function startOfNextQuarter(date: Date) {
  const quarterStartMonth = Math.floor(date.getUTCMonth() / 3) * 3
  return new Date(Date.UTC(date.getUTCFullYear(), quarterStartMonth + 3, 1))
}

function quarterNumber(date: Date) {
  return Math.floor(date.getUTCMonth() / 3) + 1
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date)
}

function seasonWindows(referenceDate = new Date()): SeasonWindow[] {
  const monthStart = startOfMonth(referenceDate)
  const quarterStart = startOfQuarter(referenceDate)
  const year = referenceDate.getUTCFullYear()
  const month = String(referenceDate.getUTCMonth() + 1).padStart(2, '0')
  const quarter = quarterNumber(referenceDate)

  return [
    {
      code: `monthly-${year}-${month}`,
      title: `${monthLabel(referenceDate)} 월간 챔피언십`,
      description: '이번 달 예측 참여, 적중, 수익, 토론 활동으로 경쟁합니다.',
      type: 'monthly',
      startsAt: monthStart,
      endsAt: startOfNextMonth(referenceDate),
      rewardDpmm: 3000,
      sortOrder: 10,
    },
    {
      code: `quarterly-${year}-q${quarter}`,
      title: `${year}년 Q${quarter} 분기 챔피언십`,
      description: '이번 분기 누적 예측 성과와 커뮤니티 활동을 기준으로 경쟁합니다.',
      type: 'quarterly',
      startsAt: quarterStart,
      endsAt: startOfNextQuarter(referenceDate),
      rewardDpmm: 10000,
      sortOrder: 20,
    },
  ]
}

function scoreFromMetrics(input: {
  predictionCount: number
  winCount: number
  stakeAmount: number
  profitAmount: number
  commentCount: number
}) {
  return (
    input.predictionCount * 100
    + input.winCount * 300
    + Math.floor(input.stakeAmount / 100)
    + Math.floor(Math.max(0, input.profitAmount) / 50)
    + input.commentCount * 75
  )
}

async function calculateSeasonProgress(
  userId: string,
  season: Pick<SeasonEventLike, 'id' | 'startsAt' | 'endsAt'>,
  client: Prisma.TransactionClient | typeof prisma = prisma
) {
  const predictions = await client.prediction.findMany({
    where: {
      userId,
      createdAt: {
        gte: season.startsAt,
        lt: season.endsAt,
      },
    },
    select: {
      amount: true,
      payout: true,
      resolved: true,
    },
  })
  const commentCount = await client.marketComment.count({
    where: {
      userId,
      status: 'visible',
      createdAt: {
        gte: season.startsAt,
        lt: season.endsAt,
      },
    },
  })

  const resolvedPredictions = predictions.filter((prediction) => prediction.resolved !== 0)
  const predictionCount = predictions.length
  const winCount = resolvedPredictions.filter((prediction) => prediction.resolved === 1).length
  const stakeAmount = predictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const resolvedStake = resolvedPredictions.reduce((sum, prediction) => sum + prediction.amount, 0)
  const resolvedPayout = resolvedPredictions.reduce((sum, prediction) => sum + prediction.payout, 0)
  const profitAmount = resolvedPayout - resolvedStake
  const score = scoreFromMetrics({
    predictionCount,
    winCount,
    stakeAmount,
    profitAmount,
    commentCount,
  })
  const lastCalculatedAt = new Date()

  return client.userSeasonProgress.upsert({
    where: {
      userId_seasonId: {
        userId,
        seasonId: season.id,
      },
    },
    update: {
      score,
      predictionCount,
      winCount,
      stakeAmount,
      profitAmount,
      commentCount,
      lastCalculatedAt,
    },
    create: {
      userId,
      seasonId: season.id,
      score,
      predictionCount,
      winCount,
      stakeAmount,
      profitAmount,
      commentCount,
      lastCalculatedAt,
    },
    select: {
      score: true,
      predictionCount: true,
      winCount: true,
      stakeAmount: true,
      profitAmount: true,
      commentCount: true,
      lastCalculatedAt: true,
    },
  })
}

async function participantIdsForSeason(
  season: Pick<SeasonEventLike, 'startsAt' | 'endsAt'>,
  currentUserId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma
) {
  const predictionUsers = await client.prediction.findMany({
    where: {
      createdAt: {
        gte: season.startsAt,
        lt: season.endsAt,
      },
    },
    distinct: ['userId'],
    select: { userId: true },
  })
  const commentUsers = await client.marketComment.findMany({
    where: {
      status: 'visible',
      createdAt: {
        gte: season.startsAt,
        lt: season.endsAt,
      },
    },
    distinct: ['userId'],
    select: { userId: true },
  })

  return Array.from(new Set([
    currentUserId,
    ...predictionUsers.map((row) => row.userId),
    ...commentUsers.map((row) => row.userId),
  ]))
}

function serializeLeaderboard(
  rows: UserSeasonProgressLike[],
  currentUserId: string
): SeasonLeaderboardRow[] {
  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: row.user.name || '도파밈 유저',
    image: row.user.image,
    score: row.score,
    predictionCount: row.predictionCount,
    winCount: row.winCount,
    stakeAmount: row.stakeAmount,
    profitAmount: row.profitAmount,
    commentCount: row.commentCount,
    isCurrentUser: row.userId === currentUserId,
  }))
}

export async function syncSeasonEvents(
  client: Prisma.TransactionClient | typeof prisma = prisma,
  referenceDate = new Date()
) {
  for (const season of seasonWindows(referenceDate)) {
    await client.seasonEvent.upsert({
      where: { code: season.code },
      update: {
        title: season.title,
        description: season.description,
        type: season.type,
        status: 'active',
        startsAt: season.startsAt,
        endsAt: season.endsAt,
        rewardDpmm: season.rewardDpmm,
        sortOrder: season.sortOrder,
      },
      create: {
        code: season.code,
        title: season.title,
        description: season.description,
        type: season.type,
        status: 'active',
        startsAt: season.startsAt,
        endsAt: season.endsAt,
        rewardDpmm: season.rewardDpmm,
        sortOrder: season.sortOrder,
      },
    })
  }
}

export async function getSeasonEventsOverview(userId: string): Promise<SeasonEventsOverview> {
  return prisma.$transaction(async (tx) => {
    await syncSeasonEvents(tx)

    const now = new Date()
    const activeSeasons = await tx.seasonEvent.findMany({
      where: {
        status: 'active',
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      orderBy: [{ sortOrder: 'asc' }, { startsAt: 'desc' }],
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        type: true,
        startsAt: true,
        endsAt: true,
        rewardDpmm: true,
        sortOrder: true,
      },
    })

    const overviewItems: SeasonOverviewItem[] = []

    for (const season of activeSeasons) {
      const participantIds = await participantIdsForSeason(season, userId, tx)

      for (const participantId of participantIds) {
        await calculateSeasonProgress(participantId, season, tx)
      }

      const myProgress = await tx.userSeasonProgress.findUnique({
        where: {
          userId_seasonId: {
            userId,
            seasonId: season.id,
          },
        },
        select: {
          score: true,
          predictionCount: true,
          winCount: true,
          stakeAmount: true,
          profitAmount: true,
          commentCount: true,
          lastCalculatedAt: true,
        },
      })
      const leaderboardRows = await tx.userSeasonProgress.findMany({
        where: { seasonId: season.id },
        take: 10,
        orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
        select: {
          userId: true,
          score: true,
          predictionCount: true,
          winCount: true,
          stakeAmount: true,
          profitAmount: true,
          commentCount: true,
          lastCalculatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      const currentProgress = myProgress || {
        score: 0,
        predictionCount: 0,
        winCount: 0,
        stakeAmount: 0,
        profitAmount: 0,
        commentCount: 0,
        lastCalculatedAt: now,
      }
      const myRank = await tx.userSeasonProgress.count({
        where: {
          seasonId: season.id,
          score: { gt: currentProgress.score },
        },
      }) + 1

      overviewItems.push({
        id: season.id,
        code: season.code,
        title: season.title,
        description: season.description,
        type: season.type,
        startsAt: season.startsAt,
        endsAt: season.endsAt,
        rewardDpmm: season.rewardDpmm,
        myRank,
        myProgress: currentProgress,
        leaderboard: serializeLeaderboard(leaderboardRows, userId),
      })
    }

    return {
      activeSeasons: overviewItems,
    }
  })
}
