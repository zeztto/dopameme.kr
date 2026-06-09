import { prisma } from '@/lib/db'

type Tone = 'primary' | 'secondary' | 'success' | 'warning'

type MarketSummary = {
  id: string
  title: string
  category: string
  status: string
  createdAt: Date
  endsAt: Date
}

type CategorySignal = {
  category: string
  activeMarkets: number
  newMarkets: number
  recentPredictions: number
  previousPredictions: number
  recentVolume: number
  previousVolume: number
  recentComments: number
  previousComments: number
}

type MarketSignal = MarketSummary & {
  recentPredictions: number
  previousPredictions: number
  recentVolume: number
  previousVolume: number
  recentComments: number
  previousComments: number
  totalAmount: number
  totalPredictions: number
  commentCount: number
}

export type TrendPredictionCategory = CategorySignal & {
  forecastScore: number
  growthRate: number
  confidence: number
  demandLabel: string
  signalTone: Tone
  reasons: string[]
}

export type TrendTopicIdea = {
  id: string
  category: string
  title: string
  forecastScore: number
  confidence: number
  suggestedWindowDays: number
  rationale: string
  signalTone: Tone
}

export type RisingMarketTrend = MarketSignal & {
  forecastScore: number
  growthRate: number
  signalTone: Tone
}

export type TrendPredictionOverview = {
  modelVersion: string
  horizonDays: number
  generatedAt: Date
  totalRecentPredictions: number
  totalRecentVolume: number
  totalRecentComments: number
  categories: TrendPredictionCategory[]
  topicIdeas: TrendTopicIdea[]
  risingMarkets: RisingMarketTrend[]
}

const TOPIC_BANK: Record<string, string[]> = {
  정치: [
    '다음 주 정치권 지지율 변화',
    '주요 법안의 국회 통과 가능성',
    '대선/총선 관련 여론조사 반등 여부',
  ],
  경제: [
    '한국은행 기준금리 동결 가능성',
    '원/달러 환율 1,400원 돌파 여부',
    '코스피 주간 상승 마감 여부',
  ],
  기술: [
    'AI 반도체 관련주 주간 상승 여부',
    '빅테크 신규 AI 제품 발표 가능성',
    '전기차 배터리 업종 반등 여부',
  ],
  스포츠: [
    '국내 축구 대표팀 다음 경기 승리 여부',
    'EPL 한국 선수 공격포인트 기록 여부',
    '프로야구 선두권 순위 변동 가능성',
  ],
  연예: [
    '신규 K-pop 음원 차트 1위 진입 여부',
    'OTT 신작 주간 화제성 1위 가능성',
    '주요 시상식 수상 예측',
  ],
  날씨: [
    '다음 주 서울 최고기온 30도 돌파 여부',
    '주말 전국 강수 가능성',
    '미세먼지 나쁨 단계 진입 여부',
  ],
  이슈: [
    '이번 주 가장 많이 언급될 사회 이슈',
    '온라인 커뮤니티 화제성 1위 주제',
    '신규 밈의 주간 확산 가능성',
  ],
  국제: [
    '미국 증시 주간 상승 마감 여부',
    '국제유가 배럴당 주요 가격 돌파 여부',
    '주요 국제 분쟁 관련 합의 가능성',
  ],
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function demandLabel(score: number) {
  if (score >= 75) return '강함'
  if (score >= 50) return '상승'
  if (score >= 30) return '관찰'
  return '약함'
}

function signalTone(score: number): Tone {
  if (score >= 75) return 'success'
  if (score >= 50) return 'primary'
  if (score >= 30) return 'warning'
  return 'secondary'
}

function getOrCreateCategory(map: Map<string, CategorySignal>, category: string) {
  const existing = map.get(category)
  if (existing) return existing

  const row: CategorySignal = {
    category,
    activeMarkets: 0,
    newMarkets: 0,
    recentPredictions: 0,
    previousPredictions: 0,
    recentVolume: 0,
    previousVolume: 0,
    recentComments: 0,
    previousComments: 0,
  }

  map.set(category, row)
  return row
}

function getOrCreateMarket(map: Map<string, MarketSignal>, market: MarketSummary) {
  const existing = map.get(market.id)
  if (existing) return existing

  const row: MarketSignal = {
    id: market.id,
    title: market.title,
    category: market.category,
    status: market.status,
    createdAt: market.createdAt,
    endsAt: market.endsAt,
    recentPredictions: 0,
    previousPredictions: 0,
    recentVolume: 0,
    previousVolume: 0,
    recentComments: 0,
    previousComments: 0,
    totalAmount: 0,
    totalPredictions: 0,
    commentCount: 0,
  }

  map.set(market.id, row)
  return row
}

function forecastCategory(row: CategorySignal): TrendPredictionCategory {
  const recentDemand = row.recentVolume + row.recentPredictions * 160 + row.recentComments * 90 + row.newMarkets * 500
  const previousDemand = row.previousVolume + row.previousPredictions * 160 + row.previousComments * 90
  const growthRate = percentChange(recentDemand, previousDemand)
  const forecastScore = clamp(
    Math.round(
      Math.log10(recentDemand + 1) * 13
      + Math.max(0, growthRate) / 5
      + row.activeMarkets * 3
      + row.newMarkets * 6
    ),
    0,
    100
  )
  const confidence = clamp(
    Math.round(
      20
      + Math.log10(recentDemand + previousDemand + 1) * 12
      + Math.min(20, row.activeMarkets * 3)
    ),
    15,
    95
  )
  const reasons = [
    row.recentVolume > row.previousVolume
      ? `참여 DPMM이 ${Math.round(percentChange(row.recentVolume, row.previousVolume)).toLocaleString()}% 증가했습니다`
      : '최근 참여 DPMM은 안정권입니다',
    row.recentPredictions > row.previousPredictions
      ? '예측 참여 수가 이전 기간보다 늘었습니다'
      : '예측 참여 수는 아직 관찰 단계입니다',
    row.recentComments > row.previousComments
      ? '댓글 신호가 증가해 토론성이 있습니다'
      : `${row.activeMarkets.toLocaleString()}개 active market이 있습니다`,
  ]

  return {
    ...row,
    forecastScore,
    growthRate,
    confidence,
    demandLabel: demandLabel(forecastScore),
    signalTone: signalTone(forecastScore),
    reasons,
  }
}

function forecastMarket(row: MarketSignal): RisingMarketTrend {
  const recentDemand = row.recentVolume + row.recentPredictions * 150 + row.recentComments * 80
  const previousDemand = row.previousVolume + row.previousPredictions * 150 + row.previousComments * 80
  const growthRate = percentChange(recentDemand, previousDemand)
  const forecastScore = clamp(
    Math.round(
      Math.log10(recentDemand + row.totalAmount + 1) * 12
      + Math.max(0, growthRate) / 6
      + Math.min(20, row.totalPredictions)
      + Math.min(10, row.commentCount)
    ),
    0,
    100
  )

  return {
    ...row,
    forecastScore,
    growthRate,
    signalTone: signalTone(forecastScore),
  }
}

function topicTitle(category: string, index: number) {
  const topics = TOPIC_BANK[category] || TOPIC_BANK.이슈
  return topics[index % topics.length]
}

function buildTopicIdeas(categories: TrendPredictionCategory[]): TrendTopicIdea[] {
  const sourceCategories = categories.length > 0
    ? categories
    : ['이슈', '경제', '기술'].map((category, index) => ({
      category,
      forecastScore: 35 - index * 5,
      confidence: 30,
      signalTone: 'warning' as Tone,
    }))

  return sourceCategories
    .slice(0, 6)
    .map((category, index) => ({
      id: `${category.category}-${index}`,
      category: category.category,
      title: topicTitle(category.category, index),
      forecastScore: category.forecastScore,
      confidence: category.confidence,
      suggestedWindowDays: category.forecastScore >= 70 ? 7 : 14,
      rationale: `${category.category} 카테고리의 최근 수요 점수와 토론 신호를 기준으로 생성한 후보입니다.`,
      signalTone: category.signalTone,
    }))
}

export async function getTrendPredictionOverview(): Promise<TrendPredictionOverview> {
  const now = new Date()
  const recentStart = daysAgo(7)
  const previousStart = daysAgo(14)

  const [predictionRows, commentRows, marketRows] = await Promise.all([
    prisma.prediction.findMany({
      where: {
        createdAt: { gte: previousStart },
        market: { hidden: false },
      },
      select: {
        amount: true,
        createdAt: true,
        market: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            createdAt: true,
            endsAt: true,
          },
        },
      },
    }),
    prisma.marketComment.findMany({
      where: {
        createdAt: { gte: previousStart },
        status: 'visible',
        market: { hidden: false },
      },
      select: {
        createdAt: true,
        market: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            createdAt: true,
            endsAt: true,
          },
        },
      },
    }),
    prisma.market.findMany({
      where: {
        hidden: false,
        OR: [
          { createdAt: { gte: previousStart } },
          { status: 'active' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
        endsAt: true,
        options: {
          select: {
            totalAmount: true,
            totalPredictions: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
  ])

  const categoryMap = new Map<string, CategorySignal>()
  const marketMap = new Map<string, MarketSignal>()

  for (const market of marketRows) {
    const category = getOrCreateCategory(categoryMap, market.category)
    const marketSignal = getOrCreateMarket(marketMap, market)
    const totalAmount = market.options.reduce((sum, option) => sum + option.totalAmount, 0)
    const totalPredictions = market.options.reduce((sum, option) => sum + option.totalPredictions, 0)

    marketSignal.totalAmount = totalAmount
    marketSignal.totalPredictions = totalPredictions
    marketSignal.commentCount = market._count.comments

    if (market.status === 'active' && market.endsAt > now) {
      category.activeMarkets += 1
    }

    if (market.createdAt >= recentStart) {
      category.newMarkets += 1
    }
  }

  for (const prediction of predictionRows) {
    const category = getOrCreateCategory(categoryMap, prediction.market.category)
    const marketSignal = getOrCreateMarket(marketMap, prediction.market)
    const isRecent = prediction.createdAt >= recentStart

    if (isRecent) {
      category.recentPredictions += 1
      category.recentVolume += prediction.amount
      marketSignal.recentPredictions += 1
      marketSignal.recentVolume += prediction.amount
    } else {
      category.previousPredictions += 1
      category.previousVolume += prediction.amount
      marketSignal.previousPredictions += 1
      marketSignal.previousVolume += prediction.amount
    }
  }

  for (const comment of commentRows) {
    const category = getOrCreateCategory(categoryMap, comment.market.category)
    const marketSignal = getOrCreateMarket(marketMap, comment.market)
    const isRecent = comment.createdAt >= recentStart

    if (isRecent) {
      category.recentComments += 1
      marketSignal.recentComments += 1
    } else {
      category.previousComments += 1
      marketSignal.previousComments += 1
    }
  }

  const categories = Array.from(categoryMap.values())
    .map(forecastCategory)
    .sort((left, right) => (
      right.forecastScore - left.forecastScore
      || right.recentVolume - left.recentVolume
      || right.recentPredictions - left.recentPredictions
    ))

  const risingMarkets = Array.from(marketMap.values())
    .map(forecastMarket)
    .filter((market) => market.status === 'active' && market.endsAt > now)
    .sort((left, right) => (
      right.forecastScore - left.forecastScore
      || right.recentVolume - left.recentVolume
      || right.totalAmount - left.totalAmount
    ))
    .slice(0, 8)

  return {
    modelVersion: 'local-trend-forecast-v1',
    horizonDays: 14,
    generatedAt: now,
    totalRecentPredictions: categories.reduce((sum, category) => sum + category.recentPredictions, 0),
    totalRecentVolume: categories.reduce((sum, category) => sum + category.recentVolume, 0),
    totalRecentComments: categories.reduce((sum, category) => sum + category.recentComments, 0),
    categories: categories.slice(0, 8),
    topicIdeas: buildTopicIdeas(categories),
    risingMarkets,
  }
}
