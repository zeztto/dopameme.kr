import { auth } from "@/auth"
import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { computeAmmOptionProbabilities } from "@/lib/markets/amm"
import { notFound } from "next/navigation"
import MarketLiveRefresh from "./MarketLiveRefresh"
import PredictionForm from "./PredictionForm"
import MarketPriceChart from "./MarketPriceChart"
import PositionLiquidationForm from "./PositionLiquidationForm"
import PositionListingBuyButton from "./PositionListingBuyButton"
import PositionTransferForm from "./PositionTransferForm"
import AdminResolveMarket from "./AdminResolveMarket"
import ToggleHiddenButton from "./ToggleHiddenButton"
import MarketComments from "./MarketComments"
import { isAdmin } from "@/lib/auth-utils"
import Header from "@/components/Header"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { DATE_LOCALES, marketsCopy } from "@/lib/i18n"
import { getCurrentLocale } from "@/lib/i18n-server"
import {
  formatMarketLongDateTime,
  getMarketCategoryLabel,
  getMarketRegionLabel,
  getMarketRegionOption,
  getMarketTimeZoneOption,
  isOverseasMarket,
} from "@/lib/markets/regions"
import {
  absoluteUrl,
  buildJsonLdScript,
  createSeoDescription,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "@/lib/seo"

type MarketPageParams = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MarketPageParams): Promise<Metadata> {
  const { id } = await params
  const market = await prisma.market.findFirst({
    where: {
      id,
      hidden: false,
      status: { in: ["active", "resolved"] },
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
    },
  })

  if (!market) {
    return {
      title: "마켓을 찾을 수 없습니다",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = createSeoDescription(market.description)
  const canonicalPath = `/markets/${market.id}`
  const imageUrl = market.imageUrl || DEFAULT_OG_IMAGE

  return {
    title: market.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: canonicalPath,
      siteName: SITE_NAME,
      title: market.title,
      description,
      publishedTime: market.createdAt.toISOString(),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: market.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: market.title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function MarketDetailPage({ params }: MarketPageParams) {
  const { id } = await params
  const session = await auth()
  const admin = await isAdmin()
  const locale = await getCurrentLocale()
  const copy = marketsCopy[locale]
  const dateLocale = DATE_LOCALES[locale]

  // 마켓 정보 조회
  const market = await prisma.market.findUnique({
    where: { id },
    include: {
      options: true,
      ammConfig: {
        select: {
          enabled: true,
          virtualLiquidity: true,
        },
      },
    },
  })

  if (!market || (market.hidden && !admin)) {
    notFound()
  }

  // 마켓 옵션 조회
  const options = market.options
  const quoteOptions = options.map((option) => ({
    id: option.id,
    totalAmount: option.totalAmount,
  }))

  const totalAmount = options.reduce((sum, opt) => sum + opt.totalAmount, 0)
  const totalPredictions = options.reduce((sum, opt) => sum + opt.totalPredictions, 0)

  const optionsWithPercentage = computeAmmOptionProbabilities(options, market.ammConfig).map(opt => ({
    ...opt,
    isWinner: market.status === 'resolved' && market.winningOptionId === opt.id,
  }))

  // 사용자 정보 조회
  let userBalance = 0
  let userPredictions: {
    id: string
    amount: number
    liquidatedAmount: number
    optionId: string
    createdAt: Date
    optionTitle: string
    activeListing: {
      id: string
      amount: number
      price: number
    } | null
  }[] = []
  let activeUser = false
  let unreadNotificationCount = 0

  if (session?.user?.id) {
    const [user, notificationCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { dpmmBalance: true, status: true },
      }),
      getUnreadNotificationCount(session.user.id),
    ])

    if (user?.status === 'active') {
      activeUser = true
      userBalance = user.dpmmBalance
      unreadNotificationCount = notificationCount
    }

    // 사용자가 이 마켓에 참여한 예측 조회
    if (activeUser) {
      const userPredictionRows = await prisma.prediction.findMany({
        where: {
          userId: session.user.id,
          marketId: id,
        },
        select: {
          id: true,
          amount: true,
          liquidatedAmount: true,
          optionId: true,
          createdAt: true,
          option: {
            select: { title: true },
          },
          listings: {
            where: { status: 'active' },
            select: {
              id: true,
              amount: true,
              price: true,
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      userPredictions = userPredictionRows.map((prediction) => ({
        id: prediction.id,
        amount: prediction.amount,
        liquidatedAmount: prediction.liquidatedAmount,
        optionId: prediction.optionId,
        createdAt: prediction.createdAt,
        optionTitle: prediction.option.title,
        activeListing: prediction.listings[0] || null,
      }))
    }
  }

  const hasParticipated = userPredictions.length > 0
  const totalUserBet = userPredictions.reduce((sum, p) => sum + p.amount, 0)
  const priceSnapshotRows = await prisma.marketPriceSnapshot.findMany({
    where: { marketId: id },
    take: 180,
    orderBy: { createdAt: 'desc' },
    select: {
      optionId: true,
      probabilityBps: true,
      createdAt: true,
    },
  })
  const sortedPriceSnapshots = [...priceSnapshotRows].reverse()
  const priceChartSeries = options.map((option) => {
    const currentBps = optionsWithPercentage.find((item) => item.id === option.id)?.probabilityBps
      ?? Math.round(10000 / options.length)
    const points = sortedPriceSnapshots
      .filter((snapshot) => snapshot.optionId === option.id)
      .map((snapshot) => ({
        createdAt: snapshot.createdAt.toISOString(),
        probabilityBps: snapshot.probabilityBps,
      }))

    return {
      optionId: option.id,
      title: option.title,
      currentBps,
      points: points.length > 0
        ? points
        : [{
          createdAt: new Date().toISOString(),
          probabilityBps: currentBps,
        }],
    }
  })
  const positionListings = await prisma.positionListing.findMany({
    where: {
      marketId: id,
      status: 'active',
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      sellerId: true,
      amount: true,
      price: true,
      createdAt: true,
      seller: {
        select: {
          name: true,
        },
      },
      option: {
        select: {
          title: true,
        },
      },
    },
  })
  const commentWhere = {
    marketId: id,
    status: 'visible',
  }
  const [comments, commentCount] = await Promise.all([
    prisma.marketComment.findMany({
      where: commentWhere,
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.marketComment.count({
      where: commentWhere,
    }),
  ])

  const commentItems = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    authorId: activeUser ? comment.userId : null,
    authorName: comment.user.name || '익명 회원',
    authorRole: comment.user.role,
  }))

  // 마감 여부 확인
  const isEnded = new Date() > new Date(market.endsAt)
  const canBet = activeUser && market.status === 'active' && !isEnded && !market.hidden
  const canLiquidate = canBet
  const canTransfer = canBet
  const currentUserId = activeUser && session?.user?.id ? session.user.id : null
  const liveRefreshEnabled = market.status === 'active' && !isEnded && !market.hidden
  const region = getMarketRegionOption(market.region)
  const timeZone = getMarketTimeZoneOption(market.timeZone)
  const winningOption = optionsWithPercentage.find((option) => option.isWinner)
  const marketStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: market.title,
    description: createSeoDescription(market.description),
    url: absoluteUrl(`/markets/${market.id}`),
    datePublished: market.createdAt.toISOString(),
    dateModified: (market.resolvedAt || market.createdAt).toISOString(),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    mainEntity: {
      "@type": "Question",
      name: market.title,
      text: market.description,
      answerCount: optionsWithPercentage.length,
      ...(winningOption
        ? {
          acceptedAnswer: {
            "@type": "Answer",
            text: winningOption.title,
            upvoteCount: winningOption.totalPredictions,
          },
        }
        : {
          suggestedAnswer: optionsWithPercentage.map((option) => ({
            "@type": "Answer",
            text: option.title,
            upvoteCount: option.totalPredictions,
          })),
        }),
    },
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLdScript(marketStructuredData) }}
      />
      <MarketLiveRefresh enabled={liveRefreshEnabled} />
      <Header
        showBackToMarkets={true}
        isAuthenticated={activeUser}
        userBalance={activeUser ? userBalance : undefined}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Market Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-black">
                {getMarketCategoryLabel(market.category, locale)}
              </span>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-black ${
                isOverseasMarket(market.region)
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 text-text-tertiary'
              }`}>
                {region.flag} {getMarketRegionLabel(market.region, locale)}
              </span>
              {isOverseasMarket(market.region) && (
                <span className="inline-block bg-accent-cyan/10 px-4 py-1.5 text-sm font-black text-accent-cyan rounded-full">
                  {copy.overseasBadge}
                </span>
              )}
              <span className="inline-block rounded-full bg-success/10 px-4 py-1.5 text-sm font-black text-success">
                {timeZone.label} {timeZone.abbreviation}
              </span>
              {isEnded && (
                <span className="inline-block bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-black">
                  {copy.endedBadge}
                </span>
              )}
              {market.status === 'resolved' && (
                <span className="inline-block bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-black">
                  {copy.resolvedBadge}
                </span>
              )}
              {admin && market.hidden && (
                <span className="inline-block bg-warning/10 text-warning px-4 py-1.5 rounded-full text-sm font-black">
                  🔒 {copy.hiddenBadge}
                </span>
              )}
              {admin && (
                <ToggleHiddenButton
                  marketId={market.id}
                  initialHidden={market.hidden}
                  canDelete={market.hidden && market.status !== 'resolved' && totalPredictions === 0}
                />
              )}
            </div>

            <h1 className="text-4xl font-black text-text-primary mb-4">
              {market.title}
            </h1>

            <p className="text-text-secondary text-lg font-medium mb-6">
              {market.description}
            </p>

            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-text-tertiary font-semibold">{copy.participantsLabel}</span>
                <div className="text-primary font-black text-2xl mt-1">
                  {totalPredictions.toLocaleString(dateLocale)}{copy.participantUnit}
                </div>
              </div>
              <div>
                <span className="text-text-tertiary font-semibold">{copy.totalAmountLabel}</span>
                <div className="text-primary font-black text-2xl mt-1">
                  {totalAmount.toLocaleString(dateLocale)} DPMM
                </div>
              </div>
              <div>
                <span className="text-text-tertiary font-semibold">{copy.closesAtLabel}</span>
                <div className="text-secondary font-black text-xl mt-1">
                  {formatMarketLongDateTime(market.endsAt, market.timeZone, dateLocale)}
                </div>
              </div>
            </div>
          </div>

          {/* User Participation Status */}
          {hasParticipated && (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-black text-text-primary mb-4">
                내 참여 현황
              </h3>
              <div className="space-y-3">
                {userPredictions.map((pred) => (
                  <div key={pred.id} className="space-y-3 rounded-dopameme-lg border-2 border-primary/10 bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-text-secondary font-semibold">
                          {pred.optionTitle}
                        </span>
                        {pred.liquidatedAmount > 0 && (
                          <div className="mt-1 text-xs font-bold text-text-tertiary">
                            누적 청산 {pred.liquidatedAmount.toLocaleString()} DPMM
                          </div>
                        )}
                      </div>
                      <span className="text-primary font-black">
                        {pred.amount.toLocaleString()} DPMM
                      </span>
                    </div>
                    {canLiquidate && !pred.activeListing && (
                      <PositionLiquidationForm
                        predictionId={pred.id}
                        currentAmount={pred.amount}
                      />
                    )}
                    {(canTransfer || pred.activeListing) && (
                      <PositionTransferForm
                        predictionId={pred.id}
                        currentAmount={pred.amount}
                        activeListing={pred.activeListing}
                      />
                    )}
                  </div>
                ))}
                <div className="pt-3 border-t-2 border-primary/20 flex justify-between items-center">
                  <span className="text-text-primary font-black">총 베팅액</span>
                  <span className="text-primary font-black text-xl">
                    {totalUserBet.toLocaleString()} DPMM
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Market Listings */}
          {positionListings.length > 0 && (
            <div className="mb-8 overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
              <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
                <h3 className="text-xl font-black text-text-primary">2차 거래</h3>
                <p className="mt-1 text-sm font-semibold text-text-tertiary">
                  다른 회원이 판매 등록한 전체 포지션
                </p>
              </div>
              <div className="divide-y-2 divide-light-border">
                {positionListings.map((listing) => {
                  const disabledReason = !activeUser
                    ? '로그인 필요'
                    : !canBet
                    ? '현재 거래 불가'
                    : listing.sellerId === currentUserId
                    ? '내 판매 등록'
                    : hasParticipated
                    ? '이미 참여한 마켓'
                    : undefined

                  return (
                    <div
                      key={listing.id}
                      className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-dopameme-pill bg-success px-3 py-1 text-xs font-black text-white">
                            판매중
                          </span>
                          <span className="text-xs font-bold text-text-tertiary">
                            {new Intl.DateTimeFormat('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(listing.createdAt)}
                          </span>
                        </div>
                        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
                          <span className="font-black text-text-primary">
                            {listing.option.title}
                          </span>
                          <span className="text-sm font-semibold text-text-secondary">
                            {listing.amount.toLocaleString()} DPMM 포지션
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-text-tertiary">
                          판매자: {listing.seller.name || '도파밈 유저'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <div className="text-left md:text-right">
                          <div className="text-xs font-bold text-text-tertiary">판매가</div>
                          <div className="mt-1 text-xl font-black text-primary">
                            {listing.price.toLocaleString()} DPMM
                          </div>
                        </div>
                        <PositionListingBuyButton
                          listingId={listing.id}
                          disabledReason={disabledReason}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <MarketPriceChart series={priceChartSeries} />

          {/* Options Layout */}
          {optionsWithPercentage.length === 2 ? (
            // 2개 선택지: 좌우 비율 막대
            <div className="mb-12">
              {/* 좌우 비율 막대 */}
              <div className="bg-white border-3 border-primary/20 rounded-3xl p-8 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className={`text-2xl font-black flex items-center gap-2 mb-2 ${
                      optionsWithPercentage[0].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                    }`}>
                      {optionsWithPercentage[0].isWinner && '👑 '}
                      {optionsWithPercentage[0].title}
                    </h3>
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className={`font-semibold ${market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'}`}>참여자</span>
                        <div className={`font-black ${optionsWithPercentage[0].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'}`}>
                          {optionsWithPercentage[0].totalPredictions.toLocaleString()}명
                        </div>
                      </div>
                      <div>
                        <span className={`font-semibold ${market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'}`}>베팅액</span>
                        <div className={`font-black ${optionsWithPercentage[0].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'}`}>
                          {optionsWithPercentage[0].totalAmount.toLocaleString()} DPMM
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className={`text-2xl font-black flex items-center justify-end gap-2 mb-2 ${
                      optionsWithPercentage[1].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                    }`}>
                      {optionsWithPercentage[1].title}
                      {optionsWithPercentage[1].isWinner && ' 👑'}
                    </h3>
                    <div className="flex gap-4 text-xs justify-end">
                      <div>
                        <span className={`font-semibold ${market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'}`}>참여자</span>
                        <div className={`font-black ${optionsWithPercentage[1].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'}`}>
                          {optionsWithPercentage[1].totalPredictions.toLocaleString()}명
                        </div>
                      </div>
                      <div>
                        <span className={`font-semibold ${market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'}`}>베팅액</span>
                        <div className={`font-black ${optionsWithPercentage[1].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'}`}>
                          {optionsWithPercentage[1].totalAmount.toLocaleString()} DPMM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 퍼센트 표시 */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-5xl font-black ${
                    optionsWithPercentage[0].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-500' : 'text-primary'
                  }`}>
                    {optionsWithPercentage[0].percentage}%
                  </span>
                  <span className={`text-5xl font-black ${
                    optionsWithPercentage[1].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-500' : 'text-secondary'
                  }`}>
                    {optionsWithPercentage[1].percentage}%
                  </span>
                </div>

                {/* 좌우 비율 막대 */}
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex mb-6">
                  <div
                    className={`h-full transition-all ${
                      optionsWithPercentage[0].isWinner
                        ? 'bg-success'
                        : market.status === 'resolved'
                        ? 'bg-gray-400'
                        : 'bg-gradient-to-r from-primary to-primary/80'
                    }`}
                    style={{ width: `${optionsWithPercentage[0].percentage}%` }}
                  />
                  <div
                    className={`h-full transition-all ${
                      optionsWithPercentage[1].isWinner
                        ? 'bg-success'
                        : market.status === 'resolved'
                        ? 'bg-gray-400'
                        : 'bg-gradient-to-l from-secondary to-secondary/80'
                    }`}
                    style={{ width: `${optionsWithPercentage[1].percentage}%` }}
                  />
                </div>

                {/* 베팅 폼 */}
                {market.status === 'resolved' ? (
                  <div className="text-center py-4">
                    <p className="text-text-tertiary text-sm font-semibold">
                      {optionsWithPercentage[0].isWinner ? '👑 ' + optionsWithPercentage[0].title : optionsWithPercentage[1].isWinner ? '👑 ' + optionsWithPercentage[1].title : ''} 승리!
                    </p>
                  </div>
                ) : hasParticipated && session?.user ? (
                  <div className="bg-gray-100 rounded-2xl p-4 text-center border-2 border-gray-300">
                    <p className="text-text-secondary text-sm font-semibold">
                      ✓ 이미 참여하셨습니다
                    </p>
                  </div>
                ) : canBet ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <PredictionForm
                      marketId={market.id}
                      optionId={optionsWithPercentage[0].id}
                      optionTitle={optionsWithPercentage[0].title}
                      userBalance={userBalance}
                      quoteOptions={quoteOptions}
                      ammConfig={market.ammConfig}
                    />
                    <PredictionForm
                      marketId={market.id}
                      optionId={optionsWithPercentage[1].id}
                      optionTitle={optionsWithPercentage[1].title}
                      userBalance={userBalance}
                      quoteOptions={quoteOptions}
                      ammConfig={market.ammConfig}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            // 3개 이상 선택지: 그리드 레이아웃
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {optionsWithPercentage.map((option) => (
                <div
                  key={option.id}
                  className={`bg-white border-3 rounded-3xl p-6 transition ${
                    option.isWinner
                      ? 'border-success bg-success/5'
                      : market.status === 'resolved'
                      ? 'border-gray-200 opacity-50'
                      : 'border-primary/20 hover:border-primary'
                  }`}
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`text-xl font-black flex items-center gap-2 ${
                        option.isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                      }`}>
                        {option.isWinner && '👑 '}
                        {option.title}
                      </h3>
                      <div className={`text-3xl font-black ${
                        option.isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-500' : 'text-primary'
                      }`}>
                        {option.percentage}%
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs mb-3">
                      <div>
                        <span className={`font-semibold ${
                          market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'
                        }`}>참여자</span>
                        <div className={`font-black ${
                          option.isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                        }`}>
                          {option.totalPredictions.toLocaleString()}명
                        </div>
                      </div>
                      <div>
                        <span className={`font-semibold ${
                          market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'
                        }`}>베팅액</span>
                        <div className={`font-black ${
                          option.isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                        }`}>
                          {option.totalAmount.toLocaleString()} DPMM
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          option.isWinner
                            ? 'bg-success'
                            : market.status === 'resolved'
                            ? 'bg-gray-400'
                            : 'bg-gradient-to-r from-primary to-secondary'
                        }`}
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Betting Form or Message */}
                  {canBet && !hasParticipated ? (
                    <PredictionForm
                      marketId={market.id}
                      optionId={option.id}
                      optionTitle={option.title}
                      userBalance={userBalance}
                      quoteOptions={quoteOptions}
                      ammConfig={market.ammConfig}
                    />
                  ) : hasParticipated && session?.user ? (
                    <div className="bg-gray-100 rounded-2xl p-4 text-center border-2 border-gray-300">
                      <p className="text-text-secondary text-sm font-semibold">
                        ✓ 이미 참여하셨습니다
                      </p>
                    </div>
                  ) : option.isWinner ? (
                    <div className="bg-success/10 rounded-2xl p-4 text-center border-2 border-success">
                      <p className="text-success text-sm font-black">
                        ✓ 당첨 선택지
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Admin Resolve Market */}
          {admin && market.status === 'active' && isEnded && (
            <div className="mb-12">
              <AdminResolveMarket
                marketId={market.id}
                options={options.map((opt) => ({
                  id: opt.id,
                  title: opt.title,
                }))}
              />
            </div>
          )}

          {/* Login Prompt */}
          {!session?.user && (
            <div className="text-center bg-secondary/5 border-2 border-secondary/20 rounded-3xl p-12">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">
                로그인하고 예측에 참여하세요
              </h3>
              <p className="text-text-secondary font-medium mb-6">
                회원가입하면 10,000 DPMM 웰컴 보너스를 드립니다!
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-primary text-white px-8 py-4 rounded-full font-black hover:bg-primary-dark hover:shadow-2xl transition text-lg"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="bg-secondary text-white px-8 py-4 rounded-full font-black hover:bg-secondary-dark hover:shadow-2xl transition text-lg"
                >
                  회원가입
                </Link>
              </div>
            </div>
          )}

          {/* Ended Message */}
          {isEnded && canBet !== true && session?.user && (
            <div className="text-center bg-gray-50 border-2 border-gray-200 rounded-3xl p-12">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">
                마감된 마켓입니다
              </h3>
              <p className="text-text-secondary font-medium">
                결과 확정을 기다리고 있습니다
              </p>
            </div>
          )}

          <MarketComments
            marketId={market.id}
            comments={commentItems}
            commentCount={commentCount}
            canComment={activeUser && (!market.hidden || admin)}
            isAuthenticated={Boolean(session?.user)}
          />
        </div>
      </main>
    </div>
  )
}
