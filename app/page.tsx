import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-primary/20 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-primary">도</span>
                <span className="text-secondary">파</span>
                <span className="text-primary">밈</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="text-text-secondary hover:text-primary transition text-sm font-semibold"
              >
                대시보드
              </Link>
              <Link
                href="/login"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-dark hover:shadow-xl transition text-sm"
              >
                로그인
              </Link>
            </div>
          </nav>
        </div>
      </header>

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

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8">
            <Link
              href="/app"
              className="bg-secondary text-white px-14 py-5 rounded-full font-black hover:bg-secondary-dark hover:shadow-2xl hover:scale-105 transition-all text-lg w-full sm:w-auto"
            >
              지금 시작하기 →
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white text-primary border-3 border-primary px-14 py-5 rounded-full font-black hover:bg-primary hover:text-white transition-all text-lg w-full sm:w-auto shadow-md"
            >
              더 알아보기
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
            <div className="text-6xl mb-6">🎮</div>
            <h3 className="text-2xl font-black mb-4 text-text-primary">게임처럼 즐기는 예측</h3>
            <p className="text-text-secondary text-base leading-relaxed font-medium">
              게임용 포인트 시스템으로 부담 없이 즐기는 예측 게임
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 via-white to-white border-3 border-primary rounded-3xl p-10 hover:border-primary hover:shadow-2xl hover:shadow-primary/30 transition-all group">
            <div className="text-6xl mb-6">💰</div>
            <h3 className="text-2xl font-black mb-4 text-text-primary">도파밈(DPM) 획득</h3>
            <p className="text-text-secondary text-base leading-relaxed font-medium">
              출석, 예측 참여, 성공 보상 등 다양한 방법으로 포인트 획득
            </p>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 via-white to-white border-3 border-secondary rounded-3xl p-10 hover:border-secondary hover:shadow-2xl hover:shadow-secondary/30 transition-all group">
            <div className="text-6xl mb-6">🏆</div>
            <h3 className="text-2xl font-black mb-4 text-text-primary">랭킹과 명예</h3>
            <p className="text-text-secondary text-base leading-relaxed font-medium">
              예측 실력을 증명하고 리더보드 상위권에 도전하세요
            </p>
          </div>
        </div>

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
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/app"
              className="inline-block bg-white text-secondary px-16 py-6 rounded-full font-black hover:shadow-2xl hover:scale-105 transition-all text-xl"
            >
              무료로 시작하기 →
            </Link>
            <Link
              href="/login"
              className="inline-block bg-white/10 backdrop-blur border-3 border-white text-white px-16 py-6 rounded-full font-black hover:bg-white hover:text-secondary transition-all text-xl"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-light-border bg-light-bg-alt mt-40">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-16 mb-16">
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
                <li><Link href="/app" className="text-text-secondary hover:text-primary transition font-semibold">대시보드</Link></li>
                <li><Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">마켓</Link></li>
                <li><Link href="/leaderboard" className="text-text-secondary hover:text-primary transition font-semibold">리더보드</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">정보</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="text-text-secondary hover:text-primary transition font-semibold">소개</Link></li>
                <li><Link href="/terms" className="text-text-secondary hover:text-primary transition font-semibold">이용약관</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-primary transition font-semibold">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-light-border pt-10 text-center">
            <p className="text-text-secondary text-base mb-3 font-semibold">
              © 2025 도파밈. All rights reserved.
            </p>
            <p className="text-text-tertiary text-sm font-medium">
              도파밈은 게임용 포인트를 사용하는 예측 플랫폼입니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
