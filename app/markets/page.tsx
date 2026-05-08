import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { isAdmin } from "@/lib/auth-utils"
import MarketList from "./market-list"
import Header from "@/components/Header"

export default async function MarketsPage() {
  const session = await auth()
  const admin = await isAdmin()
  let activeUser = false

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { status: true },
    })

    activeUser = user?.status === 'active'
  }

  // 활성 및 확정된 마켓 조회
  const allMarketsRaw = await prisma.market.findMany({
    where: {
      status: { in: ['active', 'resolved'] },
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      imageUrl: true,
      endsAt: true,
      createdAt: true,
      status: true,
      winningOptionId: true,
      hidden: true,
      options: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // 관리자가 아니면 hidden=false인 마켓만 필터링
  const allMarkets = admin
    ? allMarketsRaw
    : allMarketsRaw.filter((market) => !market.hidden)

  // status에 따라 정렬 (active 먼저, resolved 나중에)
  const sortedMarkets = allMarkets.sort((a, b) => {
    if (a.status === 'active' && b.status === 'resolved') return -1
    if (a.status === 'resolved' && b.status === 'active') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // 각 마켓의 옵션 가져오기
  const marketsWithOptions = sortedMarkets.map((market) => {
    const totalAmount = market.options.reduce((sum, opt) => sum + opt.totalAmount, 0)

    return {
      ...market,
      options: market.options.map(opt => ({
        ...opt,
        percentage: totalAmount > 0
          ? Math.round((opt.totalAmount / totalAmount) * 100)
          : Math.round(100 / market.options.length),
        isWinner: market.status === 'resolved' && market.winningOptionId === opt.id,
      })),
      totalAmount,
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <Header isAuthenticated={activeUser} />

      <main className="container mx-auto px-4 py-20">
        {/* Admin Button */}
        {admin && (
          <div className="flex justify-end mb-8">
            <Link
              href="/admin/markets/create"
              className="bg-secondary text-white px-6 py-3 rounded-full font-black hover:bg-secondary-dark hover:shadow-xl transition"
            >
              + 새 예측 시장 생성
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-white text-sm font-black bg-primary px-8 py-3 rounded-full shadow-xl">
              🎯 예측 시장
            </span>
          </div>
          <h1 className="text-5xl font-black text-text-primary mb-4">
            다양한 이슈에 예측하세요
          </h1>
          <p className="text-text-secondary text-xl font-medium">
            실시간으로 업데이트되는 예측 시장에서 DPMM을 획득하세요
          </p>
        </section>

        {/* Market List with Filter */}
        <MarketList markets={marketsWithOptions} isAdmin={admin} />
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-light-border bg-light-bg-alt mt-40">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-16 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-3xl font-black">
                  <span className="text-primary">도</span>
                  <span className="text-secondary">파</span>
                  <span className="text-primary">밈</span>
                </span>
              </div>
              <p className="text-text-secondary text-base leading-relaxed font-medium">
                게임처럼 즐기는 예측 플랫폼
              </p>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">서비스</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/app" className="text-text-secondary hover:text-primary transition font-semibold">내 활동</Link></li>
                <li><Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">예측 시장</Link></li>
                <li><Link href="/leaderboard" className="text-text-secondary hover:text-primary transition font-semibold">순위표</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">정보</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="text-text-secondary hover:text-primary transition font-semibold">도파밈 소개</Link></li>
                <li><Link href="/terms" className="text-text-secondary hover:text-primary transition font-semibold">이용약관</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-primary transition font-semibold">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-light-border pt-8 text-center">
            <p className="text-text-secondary text-base font-semibold">
              © 2025 도파밈. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
