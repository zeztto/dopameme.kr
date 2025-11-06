import { auth } from "@/auth"
import Link from "next/link"
import { db } from "@/lib/db"
import { markets, marketOptions, predictions, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { notFound } from "next/navigation"
import PredictionForm from "./PredictionForm"
import AdminResolveMarket from "./AdminResolveMarket"
import ToggleHiddenButton from "./ToggleHiddenButton"
import { isAdmin } from "@/lib/auth-utils"
import Header from "@/components/Header"

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const admin = await isAdmin()

  // 마켓 정보 조회
  const [market] = await db
    .select()
    .from(markets)
    .where(eq(markets.id, id))
    .limit(1)

  if (!market) {
    notFound()
  }

  // 마켓 옵션 조회
  const options = await db
    .select()
    .from(marketOptions)
    .where(eq(marketOptions.marketId, id))

  const totalAmount = options.reduce((sum, opt) => sum + opt.totalAmount, 0)
  const totalPredictions = options.reduce((sum, opt) => sum + opt.totalPredictions, 0)

  const optionsWithPercentage = options.map(opt => ({
    ...opt,
    percentage: totalAmount > 0 ? Math.round((opt.totalAmount / totalAmount) * 100) : Math.round(100 / options.length),
    isWinner: market.status === 'resolved' && market.winningOptionId === opt.id,
  }))

  // 사용자 정보 조회
  let userBalance = 0
  let userPredictions: any[] = []

  if (session?.user?.id) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    userBalance = user?.dpmmBalance || 0

    // 사용자가 이 마켓에 참여한 예측 조회
    userPredictions = await db
      .select({
        id: predictions.id,
        amount: predictions.amount,
        optionId: predictions.optionId,
        createdAt: predictions.createdAt,
        optionTitle: marketOptions.title,
      })
      .from(predictions)
      .innerJoin(marketOptions, eq(predictions.optionId, marketOptions.id))
      .where(
        and(
          eq(predictions.userId, session.user.id),
          eq(predictions.marketId, id)
        )
      )
      .orderBy(desc(predictions.createdAt))
  }

  const hasParticipated = userPredictions.length > 0
  const totalUserBet = userPredictions.reduce((sum, p) => sum + p.amount, 0)

  // 마감 여부 확인
  const isEnded = new Date() > new Date(market.endsAt)
  const canBet = session?.user && market.status === 'active' && !isEnded

  return (
    <div className="min-h-screen bg-white">
      <Header showBackToMarkets={true} userBalance={session?.user ? userBalance : undefined} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Market Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-black">
                {market.category}
              </span>
              {isEnded && (
                <span className="inline-block bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-black">
                  마감됨
                </span>
              )}
              {market.status === 'resolved' && (
                <span className="inline-block bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-black">
                  결과 확정
                </span>
              )}
              {admin && market.hidden && (
                <span className="inline-block bg-warning/10 text-warning px-4 py-1.5 rounded-full text-sm font-black">
                  🔒 가려짐
                </span>
              )}
              {admin && (
                <ToggleHiddenButton marketId={market.id} initialHidden={market.hidden} />
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
                <span className="text-text-tertiary font-semibold">총 참여자</span>
                <div className="text-primary font-black text-2xl mt-1">
                  {totalPredictions.toLocaleString()}명
                </div>
              </div>
              <div>
                <span className="text-text-tertiary font-semibold">총 베팅액</span>
                <div className="text-primary font-black text-2xl mt-1">
                  {totalAmount.toLocaleString()} DPMM
                </div>
              </div>
              <div>
                <span className="text-text-tertiary font-semibold">마감</span>
                <div className="text-secondary font-black text-xl mt-1">
                  {new Date(market.endsAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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
                  <div key={pred.id} className="flex justify-between items-center">
                    <span className="text-text-secondary font-semibold">
                      {pred.optionTitle}
                    </span>
                    <span className="text-primary font-black">
                      {pred.amount.toLocaleString()} DPMM
                    </span>
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
                    />
                    <PredictionForm
                      marketId={market.id}
                      optionId={optionsWithPercentage[1].id}
                      optionTitle={optionsWithPercentage[1].title}
                      userBalance={userBalance}
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
        </div>
      </main>
    </div>
  )
}
