import Link from 'next/link'
import LogoutButton from './LogoutButton'

type HeaderProps = {
  showBackToMarkets?: boolean
  userBalance?: number
  isAuthenticated?: boolean
}

export default function Header({
  showBackToMarkets = false,
  userBalance,
  isAuthenticated = userBalance !== undefined,
}: HeaderProps) {

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
            {isAuthenticated ? (
              <>
                {userBalance !== undefined && (
                  <div className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-primary font-black">
                      {userBalance.toLocaleString()} DPMM
                    </span>
                  </div>
                )}
                <Link
                  href="/app"
                  prefetch={false}
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
