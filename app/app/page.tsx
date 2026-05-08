import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // 사용자 정보 조회 (DPMM 밸런스 포함)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { dpmmBalance: true, status: true },
  })

  if (!dbUser || dbUser.status !== 'active') {
    redirect("/login")
  }

  const dpmmBalance = dbUser?.dpmmBalance || 0

  return (
    <div className="min-h-screen bg-white">
      <Header userBalance={dpmmBalance} />

      <main className="container mx-auto px-4 py-20">
        {/* Welcome Section */}
        <section className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-white text-sm font-black bg-primary px-8 py-3 rounded-full shadow-xl">
              🎮 내 활동
            </span>
          </div>
          <h1 className="text-5xl font-black text-text-primary mb-4">
            환영합니다, {session.user.name || '도파밈 유저'}님!
          </h1>
          <p className="text-text-secondary text-xl font-medium">
            지금 바로 예측을 시작해보세요
          </p>
        </section>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-primary/10 via-white to-white border-3 border-primary rounded-3xl p-10 text-center hover:shadow-2xl transition">
            <div className="text-5xl font-black text-primary mb-4">{dpmmBalance.toLocaleString()}</div>
            <div className="text-text-primary font-bold text-lg">보유 DPMM</div>
            <div className="text-text-tertiary text-sm mt-2">{dpmmBalance === 10000 ? '웰컴 보너스' : '현재 잔액'}</div>
          </div>

          <div className="bg-gradient-to-br from-success/10 via-white to-white border-3 border-success rounded-3xl p-10 text-center hover:shadow-2xl transition">
            <div className="text-5xl font-black text-success mb-4">0</div>
            <div className="text-text-primary font-bold text-lg">참여 중인 예측</div>
            <div className="text-text-tertiary text-sm mt-2">지금 시작하세요</div>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 via-white to-white border-3 border-secondary rounded-3xl p-10 text-center hover:shadow-2xl transition">
            <div className="text-5xl font-black text-secondary mb-4">-</div>
            <div className="text-text-primary font-bold text-lg">내 랭킹</div>
            <div className="text-text-tertiary text-sm mt-2">첫 예측을 시작하세요</div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-3 border-primary/30 rounded-3xl p-16 text-center">
          <h2 className="text-4xl font-black text-text-primary mb-6">
            무엇을 하시겠습니까?
          </h2>
          <p className="text-text-secondary text-lg font-medium mb-12">
            다양한 이슈에 대한 예측으로 DPMM을 획득하세요
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/markets"
              className="bg-secondary text-white px-8 py-6 rounded-full font-black hover:bg-secondary-dark hover:shadow-2xl hover:scale-105 transition text-lg"
            >
              🎯 예측 시장 둘러보기
            </Link>
            <Link
              href="/leaderboard"
              className="bg-white text-primary border-3 border-primary px-8 py-6 rounded-full font-black hover:bg-primary hover:text-white transition text-lg shadow-md"
            >
              🏆 순위표 확인하기
            </Link>
            <Link
              href="/app/wallet"
              className="bg-white text-secondary border-3 border-secondary px-8 py-6 rounded-full font-black hover:bg-secondary hover:text-white transition text-lg shadow-md"
            >
              DPMM 지갑 연결
            </Link>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="mt-16 text-center">
          <div className="inline-block bg-accent-yellow/20 border-2 border-accent-yellow px-8 py-4 rounded-2xl">
            <p className="text-accent-yellow font-black text-lg">
              🚀 더 많은 기능이 곧 출시됩니다!
            </p>
          </div>
        </section>
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
                <li><Link href="/app/wallet" className="text-text-secondary hover:text-primary transition font-semibold">DPMM 지갑</Link></li>
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
