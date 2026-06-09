import { auth } from "@/auth"
import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { isAdmin } from "@/lib/auth-utils"
import { computeAmmOptionProbabilities } from "@/lib/markets/amm"
import MarketList from "./market-list"
import Header from "@/components/Header"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { getCurrentLocale } from "@/lib/i18n-server"
import { landingCopy, marketsCopy, OPEN_GRAPH_LOCALES, publicMetadataCopy } from "@/lib/i18n"
import { absoluteUrl, buildJsonLdScript, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const copy = publicMetadataCopy[locale].markets

  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: {
      canonical: "/markets",
    },
    openGraph: {
      type: "website",
      locale: OPEN_GRAPH_LOCALES[locale],
      url: "/markets",
      siteName: SITE_NAME,
      title: copy.title,
      description: copy.description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: copy.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function MarketsPage() {
  const [session, admin, locale] = await Promise.all([
    auth(),
    isAdmin(),
    getCurrentLocale(),
  ])
  const copy = marketsCopy[locale]
  const footerCopy = landingCopy[locale]
  let activeUser = false
  let unreadNotificationCount = 0

  if (session?.user?.id) {
    const [user, notificationCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { status: true },
      }),
      getUnreadNotificationCount(session.user.id),
    ])

    activeUser = user?.status === 'active'
    unreadNotificationCount = activeUser ? notificationCount : 0
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
      region: true,
      languageCode: true,
      timeZone: true,
      imageUrl: true,
      endsAt: true,
      createdAt: true,
      status: true,
      winningOptionId: true,
      hidden: true,
      options: true,
      ammConfig: {
        select: {
          enabled: true,
          virtualLiquidity: true,
        },
      },
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
    const aLocaleMatch = a.languageCode === locale
    const bLocaleMatch = b.languageCode === locale
    if (aLocaleMatch && !bLocaleMatch) return -1
    if (!aLocaleMatch && bLocaleMatch) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // 각 마켓의 옵션 가져오기
  const marketsWithOptions = sortedMarkets.map((market) => {
    const totalAmount = market.options.reduce((sum, opt) => sum + opt.totalAmount, 0)

    return {
      ...market,
      options: computeAmmOptionProbabilities(market.options, market.ammConfig).map(opt => ({
        ...opt,
        isWinner: market.status === 'resolved' && market.winningOptionId === opt.id,
      })),
      totalAmount,
    }
  })
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "도파밈 예측 마켓",
    url: absoluteUrl("/markets"),
    itemListElement: marketsWithOptions.slice(0, 20).map((market, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/markets/${market.id}`),
      name: market.title,
    })),
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLdScript(structuredData) }}
      />
      <Header
        isAuthenticated={activeUser}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-20">
        {/* Admin Button */}
        {admin && (
          <div className="flex justify-end mb-8">
            <Link
              href="/admin/markets/create"
              className="bg-secondary text-white px-6 py-3 rounded-full font-black hover:bg-secondary-dark hover:shadow-xl transition"
            >
              {copy.adminCreate}
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-white text-sm font-black bg-primary px-8 py-3 rounded-full shadow-xl">
              {copy.heroBadge}
            </span>
          </div>
          <h1 className="text-5xl font-black text-text-primary mb-4">
            {copy.title}
          </h1>
          <p className="text-text-secondary text-xl font-medium">
            {copy.subtitle}
          </p>
        </section>

        {/* Market List with Filter */}
        <MarketList markets={marketsWithOptions} isAdmin={admin} locale={locale} copy={copy} />
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
                {footerCopy.footerTagline}
              </p>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">{footerCopy.serviceTitle}</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/app" className="text-text-secondary hover:text-primary transition font-semibold">{footerCopy.footerLinks.activity}</Link></li>
                <li><Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">{footerCopy.footerLinks.markets}</Link></li>
                <li><Link href="/leaderboard" className="text-text-secondary hover:text-primary transition font-semibold">{footerCopy.footerLinks.leaderboard}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">{footerCopy.infoTitle}</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="text-text-secondary hover:text-primary transition font-semibold">{footerCopy.footerLinks.about}</Link></li>
                <li><Link href="/terms" className="text-text-secondary hover:text-primary transition font-semibold">{footerCopy.footerLinks.terms}</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-primary transition font-semibold">{footerCopy.footerLinks.privacy}</Link></li>
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
