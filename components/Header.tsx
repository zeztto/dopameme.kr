import Link from 'next/link'
import LogoutButton from './LogoutButton'
import LanguageSwitcher from './LanguageSwitcher'
import { headerCopy } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n-server'

type HeaderProps = {
  showBackToMarkets?: boolean
  userBalance?: number
  isAuthenticated?: boolean
  unreadNotificationCount?: number
}

export default async function Header({
  showBackToMarkets = false,
  userBalance,
  isAuthenticated = userBalance !== undefined,
  unreadNotificationCount = 0,
}: HeaderProps) {
  const locale = await getCurrentLocale()
  const copy = headerCopy[locale]

  return (
    <header className="border-b-2 border-primary/20 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex flex-wrap justify-between items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-primary">도</span>
              <span className="text-secondary">파</span>
              <span className="text-primary">밈</span>
            </span>
          </Link>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-4">
            {showBackToMarkets && (
              <Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">
                {copy.backToMarkets}
              </Link>
            )}
            <LanguageSwitcher currentLocale={locale} />
            {isAuthenticated ? (
              <>
                {userBalance !== undefined && (
                  <div className="bg-primary/10 px-3 py-2 sm:px-4 rounded-full">
                    <span className="text-primary font-black text-sm sm:text-base">
                      {userBalance.toLocaleString()} DPMM
                    </span>
                  </div>
                )}
                <Link
                  href="/app"
                  prefetch={false}
                  className="bg-white border-2 border-primary text-primary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:bg-primary hover:text-white transition text-sm"
                >
                  {copy.myActivity}
                </Link>
                <Link
                  href="/feed"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.feed}
                </Link>
                <Link
                  href="/app/recommendations"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.recommendations}
                </Link>
                <Link
                  href="/app/trends"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.trends}
                </Link>
                <Link
                  href="/app/stats"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.stats}
                </Link>
                <Link
                  href="/app/achievements"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.achievements}
                </Link>
                <Link
                  href="/app/level"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.level}
                </Link>
                <Link
                  href="/app/seasons"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.seasons}
                </Link>
                <Link
                  href="/app/shop"
                  prefetch={false}
                  className="bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.shop}
                </Link>
                <Link
                  href="/notifications"
                  prefetch={false}
                  className="relative bg-white border-2 border-light-border text-text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:border-primary hover:text-primary transition text-sm"
                >
                  {copy.notifications}
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex min-w-6 items-center justify-center rounded-dopameme-pill bg-secondary px-2 py-0.5 text-xs font-black text-white shadow-token-md">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/app/wallet"
                  prefetch={false}
                  className="bg-white border-2 border-secondary text-secondary px-4 py-2.5 sm:px-6 rounded-full font-bold hover:bg-secondary hover:text-white transition text-sm"
                >
                  {copy.wallet}
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-text-secondary hover:text-primary transition font-semibold">
                  {copy.login}
                </Link>
                <Link href="/signup" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-dark hover:shadow-xl transition text-sm">
                  {copy.signup}
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
