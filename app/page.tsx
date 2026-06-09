import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import { computeAmmOptionProbabilities } from "@/lib/markets/amm";
import { DATE_LOCALES, landingCopy, OPEN_GRAPH_LOCALES, publicMetadataCopy } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import {
  formatMarketDateTime,
  getMarketCategoryLabel,
  getMarketRegionLabel,
  getMarketRegionOption,
  isOverseasMarket,
} from "@/lib/markets/regions";
import { absoluteUrl, buildJsonLdScript, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

// auth() 사용으로 인한 동적 렌더링 명시
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const copy = publicMetadataCopy[locale].landing;

  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: OPEN_GRAPH_LOCALES[locale],
      url: SITE_URL,
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
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

type LandingMarket = {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  languageCode: string;
  timeZone: string;
  endsAt: Date;
  createdAt: Date;
  options: {
    id: string;
    title: string;
    totalPredictions: number;
    totalAmount: number;
  }[];
  ammConfig: {
    enabled: boolean;
    virtualLiquidity: number;
  } | null;
  totalParticipants: number;
};

export default async function LandingPage() {
  const locale = await getCurrentLocale();
  const copy = landingCopy[locale];
  const dateLocale = DATE_LOCALES[locale];
  let marketsWithOptions: LandingMarket[] = [];

  try {
    const landingMarketSelect = {
      id: true,
      title: true,
      description: true,
      category: true,
      region: true,
      languageCode: true,
      timeZone: true,
      endsAt: true,
      createdAt: true,
      options: {
        select: {
          id: true,
          title: true,
          totalPredictions: true,
          totalAmount: true,
        },
      },
      ammConfig: {
        select: {
          enabled: true,
          virtualLiquidity: true,
        },
      },
    } as const;

    const localizedMarkets = await prisma.market.findMany({
      where: { status: 'active', hidden: false, languageCode: locale },
      select: landingMarketSelect,
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const fallbackMarkets = localizedMarkets.length >= 3
      ? []
      : await prisma.market.findMany({
        where: {
          status: 'active',
          hidden: false,
          NOT: { languageCode: locale },
        },
        select: landingMarketSelect,
        orderBy: { createdAt: 'desc' },
        take: 3 - localizedMarkets.length,
      });

    const activeMarkets = [...localizedMarkets, ...fallbackMarkets];

    // 각 마켓의 옵션과 총 참여자 수 가져오기
    marketsWithOptions = activeMarkets.map((market) => ({
      ...market,
      totalParticipants: market.options.reduce((sum, opt) => sum + opt.totalPredictions, 0),
    }));
  } catch (error) {
    console.error('Database error:', error);
    // DB 에러가 발생해도 페이지는 로드되도록 빈 배열 유지
  }

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: locale,
      description: copy.subtitleLine1,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/icon.svg"),
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLdScript(structuredData) }}
      />
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-success rounded-full blur-3xl"></div>
        </div>

        <div className="text-center space-y-10 max-w-5xl mx-auto relative z-10">
          <div className="inline-block">
            <span className="text-white text-sm font-black bg-primary px-8 py-3 rounded-full shadow-xl">
              {copy.heroBadge}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight">
            <span className="text-text-primary">{copy.heroLine1}</span>
            <br />
            <span className="text-secondary">
              {copy.heroLine2}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
            {copy.subtitleLine1}
            <br />
            {copy.subtitleLine2Prefix} <span className="text-primary font-black">도파밈(DPMM)</span>{' '}
            {copy.subtitleLine2Suffix}
          </p>

          <div className="flex justify-center items-center pt-8">
            <Link
              href="/signup"
              className="bg-secondary text-white px-14 py-5 rounded-full font-black hover:bg-secondary-dark hover:shadow-2xl hover:scale-105 transition-all text-lg"
            >
              {copy.startCta}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 pt-20 max-w-3xl mx-auto">
            {copy.stats.map((stat, index) => {
              const toneClass = [
                'border-primary hover:border-primary hover:shadow-primary/30 text-primary',
                'border-success hover:border-success hover:shadow-success/30 text-success',
                'border-secondary hover:border-secondary hover:shadow-secondary/30 text-secondary',
              ][index]

              return (
                <div key={stat.label} className={`bg-white border-3 rounded-3xl p-8 text-center hover:shadow-2xl transition-all ${toneClass}`}>
                  <div className="text-4xl font-black mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-primary font-bold">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-40 relative z-10">
          {copy.features.map((feature, index) => {
            const cardClass = [
              'from-success/10 border-success hover:border-success hover:shadow-success/30',
              'from-primary/10 border-primary hover:border-primary hover:shadow-primary/30',
              'from-secondary/10 border-secondary hover:border-secondary hover:shadow-secondary/30',
            ][index]

            return (
              <div key={feature.title} className={`bg-gradient-to-br via-white to-white border-3 rounded-3xl p-10 hover:shadow-2xl transition-all group ${cardClass}`}>
                <div className="text-6xl mb-6 text-center">{feature.icon}</div>
                <h3 className="text-2xl font-black mb-4 text-text-primary text-center">{feature.title}</h3>
                <p className="text-text-secondary text-base leading-relaxed font-medium">
                  {feature.body}
                </p>
              </div>
            )
          })}
        </div>

        {/* Active Markets */}
        {marketsWithOptions.length > 0 && (
          <div className="mt-40 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-4">
                {copy.activeMarketsTitle}
              </h2>
              <p className="text-xl text-text-secondary font-semibold">
                {copy.activeMarketsSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {marketsWithOptions.map((market) => {
                const region = getMarketRegionOption(market.region);
                const optionsWithPercentage = computeAmmOptionProbabilities(market.options, market.ammConfig).map((option) => ({
                  ...option,
                }));

                return (
                  <Link
                    key={market.id}
                    href={`/markets/${market.id}`}
                    className="bg-white border-3 border-primary/20 rounded-3xl p-6 hover:border-primary hover:shadow-2xl transition-all group"
                  >
                    {/* Category Badge */}
                    <div className="mb-4 flex items-center gap-2">
                      <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-black">
                        {getMarketCategoryLabel(market.category, locale)}
                      </span>
                      {isOverseasMarket(market.region) && (
                        <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black">
                          {region.flag} {getMarketRegionLabel(market.region, locale)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-text-primary mb-6 line-clamp-2 group-hover:text-primary transition">
                      {market.title}
                    </h3>

                    {/* Options with Percentages */}
                    {optionsWithPercentage.length === 2 ? (
                      // 2개 선택지: 좌우 비율 막대
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm flex items-center gap-1 text-text-primary">
                            {optionsWithPercentage[0].title}
                          </span>
                          <span className="font-bold text-sm flex items-center gap-1 text-text-primary">
                            {optionsWithPercentage[1].title}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-xl text-primary">
                            {optionsWithPercentage[0].percentage}%
                          </span>
                          <span className="font-black text-xl text-primary">
                            {optionsWithPercentage[1].percentage}%
                          </span>
                        </div>
                        <div className="h-12 bg-gray-100 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                            style={{ width: `${optionsWithPercentage[0].percentage}%` }}
                          />
                          <div
                            className="h-full bg-gradient-to-l from-secondary to-secondary/70 transition-all"
                            style={{ width: `${optionsWithPercentage[1].percentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      // 3개 이상 선택지: 개별 막대
                      <div className="space-y-3 mb-6">
                        {optionsWithPercentage.map((option) => (
                          <div key={option.id} className="relative">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-bold text-sm flex items-center gap-2 text-text-primary">
                                {option.title}
                              </span>
                              <span className="font-black text-lg text-primary">
                                {option.percentage}%
                              </span>
                            </div>
                            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                      <div className="text-xs font-semibold text-text-tertiary">
                        {copy.totalPrefix} {market.options.reduce((sum, opt) => sum + opt.totalAmount, 0).toLocaleString()} DPMM
                      </div>
                      <div className="text-xs font-semibold text-text-tertiary">
                        {formatMarketDateTime(market.endsAt, market.timeZone, dateLocale)} {copy.endsAtSuffix}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/markets"
                className="inline-block bg-white text-primary border-3 border-primary px-12 py-4 rounded-full font-black hover:bg-primary hover:text-white transition-all text-lg"
              >
                {copy.allMarketsCta}
              </Link>
            </div>
          </div>
        )}

        {/* News & Press Section */}
        <div className="mt-40 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-6">
              {copy.futureTitle}
            </h2>
            <p className="text-text-secondary text-xl font-semibold">
              {copy.futureSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {copy.news.map((item, index) => {
              const cardClass = [
                'border-accent-yellow/40 hover:border-accent-yellow hover:shadow-accent-yellow/30',
                'border-primary/40 hover:border-primary hover:shadow-primary/30',
                'border-secondary/40 hover:border-secondary hover:shadow-secondary/30',
              ][index]
              const badgeClass = [
                'text-accent-yellow bg-accent-yellow/10',
                'text-primary bg-primary/10',
                'text-secondary bg-secondary/10',
              ][index]
              const footerClass = [
                'text-success',
                'text-accent-cyan',
                'text-text-primary',
              ][index]

              return (
                <div key={item.title} className={`bg-white border-3 rounded-3xl p-10 hover:shadow-2xl transition-all ${cardClass}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`text-xs font-black px-5 py-2 rounded-full ${badgeClass}`}>
                      {item.badge}
                    </span>
                    <span className="text-text-tertiary text-xs font-bold">{item.date}</span>
                  </div>
                  <h3 className="text-2xl font-black text-text-primary mb-4">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-base mb-5 leading-relaxed font-medium">
                    {item.body}
                  </p>
                  <div className={`font-black text-base ${footerClass}`}>
                    {item.footer}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats Bar */}
          <div className="mt-16 bg-gradient-to-r from-primary/5 via-success/5 to-secondary/5 border-3 border-light-border rounded-3xl p-12 shadow-2xl">
            <div className="grid md:grid-cols-4 gap-8">
              {copy.marketStats.map((stat, index) => {
                const itemClass = [
                  'border-accent-yellow/30 hover:border-accent-yellow text-accent-yellow',
                  'border-success/30 hover:border-success text-success',
                  'border-accent-cyan/30 hover:border-accent-cyan text-accent-cyan',
                  'border-primary/30 hover:border-primary text-primary',
                ][index]

                return (
                  <div key={stat.label} className={`text-center bg-white border-3 rounded-3xl p-8 hover:shadow-xl transition-all ${itemClass}`}>
                    <div className="text-5xl font-black mb-3">{stat.value}</div>
                    <div className="text-base text-text-primary font-bold">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mt-40 bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-4 border-primary/30 rounded-3xl p-16 shadow-2xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-text-primary text-center mb-20">
            {copy.howTitle}
          </h2>

          <div className="grid md:grid-cols-4 gap-10">
            {copy.steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 text-white shadow-xl ${
                  index % 2 === 0 ? 'bg-primary' : 'bg-secondary'
                }`}>
                  {index + 1}
                </div>
                <h4 className="font-black text-xl mb-4 text-text-primary">{step.title}</h4>
                <p className="text-base text-text-secondary leading-relaxed font-medium">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-40 bg-secondary p-16 text-center rounded-3xl shadow-2xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            {copy.ctaTitle}
          </h2>
          <p className="text-2xl text-white mb-12 font-bold">
            {copy.ctaBodyPrefix} <span className="font-black bg-white text-secondary px-4 py-1 rounded-lg">10,000 DPMM</span>{' '}
            {copy.ctaBodySuffix}
          </p>
          <div className="flex justify-center items-center">
            <Link
              href="/signup"
              className="inline-block bg-white text-secondary px-16 py-6 rounded-full font-black hover:shadow-2xl hover:scale-105 transition-all text-xl"
            >
              {copy.ctaButton}
            </Link>
          </div>
        </div>
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
                {copy.footerTagline}
              </p>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">{copy.serviceTitle}</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/login" className="text-text-secondary hover:text-primary transition font-semibold">{copy.footerLinks.activity}</Link></li>
                <li><Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">{copy.footerLinks.markets}</Link></li>
                <li><Link href="/leaderboard" className="text-text-secondary hover:text-primary transition font-semibold">{copy.footerLinks.leaderboard}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">{copy.infoTitle}</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="text-text-secondary hover:text-primary transition font-semibold">{copy.footerLinks.about}</Link></li>
                <li><Link href="/terms" className="text-text-secondary hover:text-primary transition font-semibold">{copy.footerLinks.terms}</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-primary transition font-semibold">{copy.footerLinks.privacy}</Link></li>
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
  );
}
