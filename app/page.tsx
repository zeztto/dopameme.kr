import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { markets, marketOptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Header from "@/components/Header";

// auth() 사용으로 인한 동적 렌더링 명시
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  let session = null;
  let marketsWithOptions: any[] = [];

  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error:', error);
  }

  try {
    // 진행중인 예측 마켓 3개 가져오기
    const activeMarkets = await db
      .select({
        id: markets.id,
        title: markets.title,
        description: markets.description,
        category: markets.category,
        endsAt: markets.endsAt,
        createdAt: markets.createdAt,
      })
      .from(markets)
      .where(eq(markets.status, 'active'))
      .orderBy(desc(markets.createdAt))
      .limit(3);

    // 각 마켓의 옵션과 총 참여자 수 가져오기
    marketsWithOptions = await Promise.all(
      activeMarkets.map(async (market) => {
        const options = await db
          .select()
          .from(marketOptions)
          .where(eq(marketOptions.marketId, market.id));

        const totalParticipants = options.reduce((sum, opt) => sum + opt.totalPredictions, 0);

        return {
          ...market,
          options,
          totalParticipants,
        };
      })
    );
  } catch (error) {
    console.error('Database error:', error);
    // DB 에러가 발생해도 페이지는 로드되도록 빈 배열 유지
  }
  return (
    <div className="min-h-screen bg-white">
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
              🎮 게임처럼 즐기는 예측 플랫폼
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight">
            <span className="text-text-primary">세상의 모든 이슈</span>
            <br />
            <span className="text-secondary">
              예측하고 즐겨라
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
            정치, 경제, 스포츠, 연예까지!
            <br />
            당신의 예측으로 <span className="text-primary font-black">도파밈(DPM)</span>을 획득하세요
          </p>

          <div className="flex justify-center items-center pt-8">
            <Link
              href="/app"
              className="bg-secondary text-white px-14 py-5 rounded-full font-black hover:bg-secondary-dark hover:shadow-2xl hover:scale-105 transition-all text-lg"
            >
              지금 시작하기 →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 pt-20 max-w-3xl mx-auto">
            <div className="bg-white border-3 border-primary rounded-3xl p-8 text-center hover:border-primary hover:shadow-2xl hover:shadow-primary/30 transition-all">
              <div className="text-4xl font-black text-primary mb-2">
                10,000+
              </div>
              <div className="text-sm text-text-primary font-bold">활성 사용자</div>
            </div>
            <div className="bg-white border-3 border-success rounded-3xl p-8 text-center hover:border-success hover:shadow-2xl hover:shadow-success/30 transition-all">
              <div className="text-4xl font-black text-success mb-2">
                500+
              </div>
              <div className="text-sm text-text-primary font-bold">예측 마켓</div>
            </div>
            <div className="bg-white border-3 border-secondary rounded-3xl p-8 text-center hover:border-secondary hover:shadow-2xl hover:shadow-secondary/30 transition-all">
              <div className="text-4xl font-black text-secondary mb-2">
                95%
              </div>
              <div className="text-sm text-text-primary font-bold">만족도</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-40 relative z-10">
          <div className="bg-gradient-to-br from-success/10 via-white to-white border-3 border-success rounded-3xl p-10 hover:border-success hover:shadow-2xl hover:shadow-success/30 transition-all group">
            <div className="text-6xl mb-6 text-center">🎮</div>
            <h3 className="text-2xl font-black mb-4 text-text-primary text-center">게임처럼 즐기는 예측</h3>
            <p className="text-text-secondary text-base leading-relaxed font-medium">
              게임용 포인트 시스템으로 부담 없이 예측 게임을 즐기세요
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 via-white to-white border-3 border-primary rounded-3xl p-10 hover:border-primary hover:shadow-2xl hover:shadow-primary/30 transition-all group">
            <div className="text-6xl mb-6 text-center">💰</div>
            <h3 className="text-2xl font-black mb-4 text-text-primary text-center">도파밈(DPM) 획득</h3>
            <p className="text-text-secondary text-base leading-relaxed font-medium">
              출석, 예측 참여, 성공 보상 등 다양한 방법으로 포인트를 얻으세요
            </p>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 via-white to-white border-3 border-secondary rounded-3xl p-10 hover:border-secondary hover:shadow-2xl hover:shadow-secondary/30 transition-all group">
            <div className="text-6xl mb-6 text-center">🏆</div>
            <h3 className="text-2xl font-black mb-4 text-text-primary text-center">명예와 보상</h3>
            <p className="text-text-secondary text-base leading-relaxed font-medium">
              예측 실력을 증명하고 순위표 상위권에 도전해 특별한 보상을 획득하세요
            </p>
          </div>
        </div>

        {/* Active Markets */}
        {marketsWithOptions.length > 0 && (
          <div className="mt-40 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-4">
                지금 진행중인 예측
              </h2>
              <p className="text-xl text-text-secondary font-semibold">
                실시간으로 참여하고 있는 핫한 예측들
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {marketsWithOptions.map((market) => {
                // 총 베팅액 기준으로 percentage 계산
                const totalAmount = market.options.reduce((sum, opt) => sum + opt.totalAmount, 0);
                const optionsWithPercentage = market.options.map((option) => ({
                  ...option,
                  percentage: totalAmount > 0
                    ? Math.round((option.totalAmount / totalAmount) * 100)
                    : Math.round(100 / market.options.length), // 참여자 없으면 균등 분배
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
                        {market.category}
                      </span>
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
                        총 {market.options.reduce((sum, opt) => sum + opt.totalAmount, 0).toLocaleString()} DPM
                      </div>
                      <div className="text-xs font-semibold text-text-tertiary">
                        {new Date(market.endsAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} 마감
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
                모든 예측 보기 →
              </Link>
            </div>
          </div>
        )}

        {/* News & Press Section */}
        <div className="mt-40 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-6">
              예측 시장의 미래
            </h2>
            <p className="text-text-secondary text-xl font-semibold">
              글로벌 예측 시장은 빠르게 성장하고 있으며, 첨단 기술로 더욱 정교해지고 있습니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Card 1 */}
            <div className="bg-white border-3 border-accent-yellow/40 rounded-3xl p-10 hover:border-accent-yellow hover:shadow-2xl hover:shadow-accent-yellow/30 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-accent-yellow text-xs font-black bg-accent-yellow/10 px-5 py-2 rounded-full">
                  MARKET INSIGHT
                </span>
                <span className="text-text-tertiary text-xs font-bold">2024.12</span>
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-4">
                글로벌 예측 시장 규모 580억 달러 돌파
              </h3>
              <p className="text-text-secondary text-base mb-5 leading-relaxed font-medium">
                블룸버그 리서치에 따르면, 2024년 글로벌 예측 시장 규모는 580억 달러를 넘어섰으며,
                2030년까지 연평균 23.4% 성장이 예상됩니다.
              </p>
              <div className="text-success font-black text-base">
                📈 연평균 23.4% 성장 전망
              </div>
            </div>

            {/* News Card 2 */}
            <div className="bg-white border-3 border-primary/40 rounded-3xl p-10 hover:border-primary hover:shadow-2xl hover:shadow-primary/30 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-primary text-xs font-black bg-primary/10 px-5 py-2 rounded-full">
                  TECHNOLOGY
                </span>
                <span className="text-text-tertiary text-xs font-bold">2024.11</span>
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-4">
                AI 기반 예측 알고리즘의 혁신
              </h3>
              <p className="text-text-secondary text-base mb-5 leading-relaxed font-medium">
                MIT 연구진이 개발한 베이지안 추론과 머신러닝을 결합한 LMSR(Logarithmic Market Scoring Rule)
                알고리즘은 예측 정확도를 87%까지 향상시켰습니다.
              </p>
              <div className="text-accent-cyan font-black text-base">
                🤖 정확도 87% 달성
              </div>
            </div>

            {/* News Card 3 */}
            <div className="bg-white border-3 border-secondary/40 rounded-3xl p-10 hover:border-secondary hover:shadow-2xl hover:shadow-secondary/30 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-secondary text-xs font-black bg-secondary/10 px-5 py-2 rounded-full">
                  INDUSTRY
                </span>
                <span className="text-text-tertiary text-xs font-bold">2024.10</span>
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-4">
                한국, 예측 시장 규제 완화 논의
              </h3>
              <p className="text-text-secondary text-base mb-5 leading-relaxed font-medium">
                금융위원회는 게임형 예측 플랫폼에 대한 규제 샌드박스를 검토 중입니다.
                포인트 기반 시스템은 사행성 규제에서 제외될 전망입니다.
              </p>
              <div className="text-text-primary font-black text-base">
                🇰🇷 규제 샌드박스 추진
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 bg-gradient-to-r from-primary/5 via-success/5 to-secondary/5 border-3 border-light-border rounded-3xl p-12 shadow-2xl">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center bg-white border-3 border-accent-yellow/30 rounded-3xl p-8 hover:border-accent-yellow hover:shadow-xl transition-all">
                <div className="text-5xl font-black text-accent-yellow mb-3">$580B</div>
                <div className="text-base text-text-primary font-bold">글로벌 시장 규모</div>
              </div>
              <div className="text-center bg-white border-3 border-success/30 rounded-3xl p-8 hover:border-success hover:shadow-xl transition-all">
                <div className="text-5xl font-black text-success mb-3">23.4%</div>
                <div className="text-base text-text-primary font-bold">연평균 성장률</div>
              </div>
              <div className="text-center bg-white border-3 border-accent-cyan/30 rounded-3xl p-8 hover:border-accent-cyan hover:shadow-xl transition-all">
                <div className="text-5xl font-black text-accent-cyan mb-3">87%</div>
                <div className="text-base text-text-primary font-bold">AI 예측 정확도</div>
              </div>
              <div className="text-center bg-white border-3 border-primary/30 rounded-3xl p-8 hover:border-primary hover:shadow-xl transition-all">
                <div className="text-5xl font-black text-primary mb-3">150M+</div>
                <div className="text-base text-text-primary font-bold">전세계 사용자</div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mt-40 bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-4 border-primary/30 rounded-3xl p-16 shadow-2xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-text-primary text-center mb-20">
            도파밈, 이렇게 즐기세요!
          </h2>

          <div className="grid md:grid-cols-4 gap-10">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 text-white shadow-xl">
                1
              </div>
              <h4 className="font-black text-xl mb-4 text-text-primary">회원가입</h4>
              <p className="text-base text-text-secondary leading-relaxed font-medium">
                간편하게 가입하고 웰컴 보너스 받기
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 text-white shadow-xl">
                2
              </div>
              <h4 className="font-black text-xl mb-4 text-text-primary">마켓 선택</h4>
              <p className="text-base text-text-secondary leading-relaxed font-medium">
                관심있는 이슈의 예측 마켓 찾기
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 text-white shadow-xl">
                3
              </div>
              <h4 className="font-black text-xl mb-4 text-text-primary">예측 참여</h4>
              <p className="text-base text-text-secondary leading-relaxed font-medium">
                DPM으로 Yes/No 지분 구매하기
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 text-white shadow-xl">
                4
              </div>
              <h4 className="font-black text-xl mb-4 text-text-primary">보상 획득</h4>
              <p className="text-base text-text-secondary leading-relaxed font-medium">
                예측 성공 시 DPM 보상 받기
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-40 bg-secondary p-16 text-center rounded-3xl shadow-2xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            지금 바로 시작하세요!
          </h2>
          <p className="text-2xl text-white mb-12 font-bold">
            무료 가입하고 <span className="font-black bg-white text-secondary px-4 py-1 rounded-lg">10,000 DPM</span> 웰컴 보너스를 받아가세요
          </p>
          <div className="flex justify-center items-center">
            <Link
              href="/app"
              className="inline-block bg-white text-secondary px-16 py-6 rounded-full font-black hover:shadow-2xl hover:scale-105 transition-all text-xl"
            >
              무료로 시작하기 →
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
  );
}
