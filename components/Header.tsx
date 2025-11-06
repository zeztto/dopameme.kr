import Link from 'next/link'
import { auth } from '@/auth'
import LogoutButton from './LogoutButton'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type HeaderProps = {
  showBackToMarkets?: boolean
  userBalance?: number
}

export default async function Header({ showBackToMarkets = false, userBalance }: HeaderProps) {
  const session = await auth()

  // 사용자 잔액 조회 (prop으로 전달되지 않은 경우)
  let balance = userBalance
  if (session?.user?.id && balance === undefined) {
    const [dbUser] = await db
      .select({ dpmBalance: users.dpmBalance })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
    balance = dbUser?.dpmBalance || 0
  }

  return (
    <header className="border-b-2 border-primary/20 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-primary">도</span>
              <span className="text-secondary">파</span>
              <span className="text-primary">밈</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {showBackToMarkets && (
              <Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">
                ← 마켓 목록
              </Link>
            )}
            {session?.user ? (
              <>
                {balance !== undefined && (
                  <div className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-primary font-black">
                      {balance.toLocaleString()} DPM
                    </span>
                  </div>
                )}
                <Link
                  href="/app"
                  className="bg-white border-2 border-primary text-primary px-6 py-2.5 rounded-full font-bold hover:bg-primary hover:text-white transition text-sm"
                >
                  내 활동
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-text-secondary hover:text-primary transition font-semibold">
                  로그인
                </Link>
                <Link href="/signup" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-dark hover:shadow-xl transition text-sm">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
