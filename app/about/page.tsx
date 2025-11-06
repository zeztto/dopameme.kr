import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "도파밈의 창립 스토리, 창립자 소개, 개발 히스토리, 투자 현황, 언론 보도 및 규제 준수 현황을 확인하세요. 게임처럼 즐기는 대한민국 No.1 예측 플랫폼 도파밈입니다.",
  keywords: ["도파밈 소개", "도파밈 회사", "예측 플랫폼", "창립자", "투자 유치", "스타트업", "레온 스카이", "밈쭌", "강블리", "게임 예측", "LMSR", "AI 예측"],
  openGraph: {
    title: "도파밈 소개 - 게임처럼 즐기는 예측 플랫폼",
    description: "도파밈의 창립 스토리, 창립자 소개, 투자 현황 및 규제 준수 현황을 확인하세요.",
    url: "https://dopameme.kr/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "도파밈 소개 - 게임처럼 즐기는 예측 플랫폼",
    description: "도파밈의 창립 스토리, 창립자 소개, 투자 현황 및 규제 준수 현황을 확인하세요.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center mb-32">
          <div className="inline-block mb-6">
            <span className="text-white text-sm font-black bg-primary px-8 py-3 rounded-full shadow-xl">
              🎯 About Dopameme
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-text-primary mb-6">
            도파밈 소개
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-medium">
            게임처럼 즐기는 예측 플랫폼, 도파밈의 이야기를 소개합니다
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-32">
          <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-3 border-primary rounded-3xl p-16 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl">
                🎯
              </div>
              <h2 className="text-4xl font-black text-text-primary">우리의 미션</h2>
            </div>
            <p className="text-2xl text-text-secondary leading-relaxed font-semibold">
              도파밈은 <span className="text-primary font-black">대한민국 No.1 이슈 예측 플랫폼</span>으로,
              사용자들이 뉴스와 이슈를 단순 소비하는 것을 넘어 적극적으로 자신의 의견을
              <span className="text-secondary font-black"> '예측'이라는 게임</span>을 통해 표현하고 즐기는
              새로운 인포테인먼트 문화를 선도합니다.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6">도파밈 스토리</h2>
            <p className="text-xl text-text-secondary font-semibold">왜 도파밈을 만들었을까요?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border-3 border-primary/40 rounded-3xl p-10 hover:border-primary hover:shadow-2xl transition-all">
              <div className="text-5xl mb-6">💡</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">도파밈의 탄생</h3>
              <p className="text-text-secondary leading-relaxed font-medium">
                2024년, 우리는 뉴스와 이슈가 단순 소비되는 것에 주목했습니다.
                사람들은 의견을 가지고 있지만, 이를 표현하고 검증받을 재미있는 방법이 없었습니다.
                그래서 <span className="text-primary font-bold">'예측'이라는 게임 형태</span>로
                누구나 안전하게 자신의 생각을 표현할 수 있는 플랫폼을 만들었습니다.
              </p>
            </div>

            <div className="bg-white border-3 border-secondary/40 rounded-3xl p-10 hover:border-secondary hover:shadow-2xl transition-all">
              <div className="text-5xl mb-6">🎮</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">왜 '도파밈'인가?</h3>
              <p className="text-text-secondary leading-relaxed font-medium">
                <span className="text-secondary font-bold">도파민(Dopamine)</span>과
                <span className="text-primary font-bold"> 밈(Meme)</span>의 합성어로,
                최신 트렌드와 이슈를 가장 빠르고 재밌게(도파민 터지게) 다루는 플랫폼입니다.
                게임용 포인트 시스템으로 누구나 부담 없이 즐길 수 있으며,
                예측을 통해 자신의 통찰력을 증명할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* Company Journey - 통합 섹션 */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6">도파밈의 여정</h2>
            <p className="text-xl text-text-secondary font-semibold">창립부터 지금까지, 그리고 앞으로</p>
          </div>

          {/* 창립자 소개 */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black text-text-primary mb-4">창립자</h3>
              <p className="text-lg text-text-secondary font-semibold">도파밈을 만든 사람들</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              <div className="bg-white border-3 border-primary/40 rounded-3xl p-10 text-center hover:border-primary hover:shadow-2xl transition-all">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto mb-6 flex items-center justify-center text-6xl">
                  👨‍💼
                </div>
                <h4 className="text-2xl font-black text-text-primary mb-2">레온 스카이</h4>
                <div className="text-primary font-bold mb-4">CEO & Co-Founder</div>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  전 스타트업 경영 10년 경력, 서울대 경영학과 졸업.
                  게이미피케이션과 예측 시장 전문가
                </p>
              </div>

              <div className="bg-white border-3 border-secondary/40 rounded-3xl p-10 text-center hover:border-secondary hover:shadow-2xl transition-all">
                <div className="w-32 h-32 bg-gradient-to-br from-secondary to-secondary-dark rounded-full mx-auto mb-6 flex items-center justify-center text-6xl">
                  👨‍💻
                </div>
                <h4 className="text-2xl font-black text-text-primary mb-2">밈쭌</h4>
                <div className="text-secondary font-bold mb-4">CTO & Co-Founder</div>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  전 네이버 시니어 개발자, KAIST 전산학 박사.
                  AI/ML 및 분산 시스템 전문가
                </p>
              </div>

              <div className="bg-white border-3 border-success/40 rounded-3xl p-10 text-center hover:border-success hover:shadow-2xl transition-all">
                <div className="w-32 h-32 bg-gradient-to-br from-success to-success-dark rounded-full mx-auto mb-6 flex items-center justify-center text-6xl">
                  👩‍🎨
                </div>
                <h4 className="text-2xl font-black text-text-primary mb-2">강블리</h4>
                <div className="text-success font-bold mb-4">CPO & Co-Founder</div>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  전 카카오 UX 디자인 리드, 홍익대 디자인학과 졸업.
                  프로덕트 디자인 및 사용자 경험 전문가
                </p>
              </div>
            </div>
          </div>

          {/* 창립 히스토리 */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black text-text-primary mb-4">창립 히스토리</h3>
              <p className="text-lg text-text-secondary font-semibold">도파밈이 시작된 순간들</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-br from-primary/5 to-white border-3 border-primary rounded-3xl p-10 hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    🚀
                  </div>
                  <div>
                    <div className="text-primary font-black text-sm mb-2">2024년 1월</div>
                    <h4 className="text-2xl font-black text-text-primary mb-3">회사 설립</h4>
                    <p className="text-text-secondary leading-relaxed font-medium">
                      레온 스카이, 밈쭌, 강블리 세 명의 공동 창립자가 의기투합하여
                      주식회사 도파밈을 설립했습니다. 서울 강남구 테헤란로에 첫 오피스를 열고
                      본격적인 사업을 시작했습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary/5 to-white border-3 border-secondary rounded-3xl p-10 hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    💰
                  </div>
                  <div>
                    <div className="text-secondary font-black text-sm mb-2">2024년 3월</div>
                    <h4 className="text-2xl font-black text-text-primary mb-3">시드 투자 유치 (30억원)</h4>
                    <p className="text-text-secondary leading-relaxed font-medium">
                      프라이머 사제파트너스를 리드로 국내 유수의 벤처캐피탈로부터 시드 라운드 30억원 투자 유치에 성공했습니다.
                      초기 팀 구성, 기술 개발, 시장 검증에 필요한 자금을 확보하며 본격적인 성장 발판을 마련했습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-success/5 to-white border-3 border-success rounded-3xl p-10 hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-success rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    👥
                  </div>
                  <div>
                    <div className="text-success font-black text-sm mb-2">2024년 6월</div>
                    <h4 className="text-2xl font-black text-text-primary mb-3">핵심 인재 영입</h4>
                    <p className="text-text-secondary leading-relaxed font-medium">
                      국내 대기업 및 글로벌 테크 기업 출신의 뛰어난 개발자, 디자이너,
                      데이터 사이언티스트들이 도파밈에 합류했습니다.
                      20명 규모의 강력한 팀을 구성하여 제품 개발에 박차를 가했습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-accent-purple/5 to-white border-3 border-accent-purple rounded-3xl p-10 hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-accent-purple rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    🎉
                  </div>
                  <div>
                    <div className="text-accent-purple font-black text-sm mb-2">2024년 9월</div>
                    <h4 className="text-2xl font-black text-text-primary mb-3">베타 서비스 런칭</h4>
                    <p className="text-text-secondary leading-relaxed font-medium">
                      1,000명의 초기 사용자를 대상으로 비공개 베타 서비스를 시작했습니다.
                      실제 사용자 피드백을 바탕으로 UX 개선, 버그 수정, 기능 고도화를 진행하며
                      정식 출시를 준비했습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 개발 히스토리 타임라인 */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black text-text-primary mb-4">개발 타임라인</h3>
              <p className="text-lg text-text-secondary font-semibold">기술 개발과 제품 진화 과정</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-success"></div>

                {/* Timeline Items */}
                <div className="space-y-12">
                  {/* 2024.Q1 */}
                  <div className="relative pl-24">
                    <div className="absolute left-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl">
                      Q1
                    </div>
                    <div className="bg-white border-3 border-primary/40 rounded-3xl p-8 hover:border-primary hover:shadow-xl transition-all">
                      <div className="text-primary font-black text-sm mb-2">2024년 1월 - 3월</div>
                      <h4 className="text-2xl font-black text-text-primary mb-3">프로젝트 기획 및 시장 조사</h4>
                      <p className="text-text-secondary font-medium leading-relaxed">
                        예측 시장 분석, 사용자 니즈 파악, 비즈니스 모델 설계.
                        LMSR(Logarithmic Market Scoring Rule) 알고리즘 연구 시작
                      </p>
                    </div>
                  </div>

                  {/* 2024.Q2 */}
                  <div className="relative pl-24">
                    <div className="absolute left-0 w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl">
                      Q2
                    </div>
                    <div className="bg-white border-3 border-secondary/40 rounded-3xl p-8 hover:border-secondary hover:shadow-xl transition-all">
                      <div className="text-secondary font-black text-sm mb-2">2024년 4월 - 6월</div>
                      <h4 className="text-2xl font-black text-text-primary mb-3">핵심 기술 개발 착수</h4>
                      <p className="text-text-secondary font-medium leading-relaxed">
                        예측 알고리즘 설계, LMSR 기반 시장 메커니즘 구현, AI 모델 학습 시작.
                        Next.js, Supabase 기반 아키텍처 구축
                      </p>
                    </div>
                  </div>

                  {/* 2024.Q3 */}
                  <div className="relative pl-24">
                    <div className="absolute left-0 w-16 h-16 bg-success rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl">
                      Q3
                    </div>
                    <div className="bg-white border-3 border-success/40 rounded-3xl p-8 hover:border-success hover:shadow-xl transition-all">
                      <div className="text-success font-black text-sm mb-2">2024년 7월 - 9월</div>
                      <h4 className="text-2xl font-black text-text-primary mb-3">MVP 개발 완료</h4>
                      <p className="text-text-secondary font-medium leading-relaxed">
                        베타 버전 출시, 초기 사용자 테스트, 피드백 수집 및 개선.
                        AI 예측 정확도 87% 달성
                      </p>
                    </div>
                  </div>

                  {/* 2024.Q4 */}
                  <div className="relative pl-24">
                    <div className="absolute left-0 w-16 h-16 bg-accent-purple rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl">
                      Q4
                    </div>
                    <div className="bg-white border-3 border-accent-purple/40 rounded-3xl p-8 hover:border-accent-purple hover:shadow-xl transition-all">
                      <div className="text-accent-purple font-black text-sm mb-2">2024년 10월 - 12월</div>
                      <h4 className="text-2xl font-black text-text-primary mb-3">플랫폼 고도화</h4>
                      <p className="text-text-secondary font-medium leading-relaxed">
                        게이미피케이션 강화, 리더보드 시스템, 소셜 기능 추가.
                        보안 강화 및 ISMS-P 인증 준비
                      </p>
                    </div>
                  </div>

                  {/* 2025.Q1 */}
                  <div className="relative pl-24">
                    <div className="absolute left-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl">
                      NOW
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-3 border-primary rounded-3xl p-8 shadow-2xl">
                      <div className="text-primary font-black text-sm mb-2">2025년 1월 - 현재</div>
                      <h4 className="text-2xl font-black text-text-primary mb-3">정식 런칭 준비</h4>
                      <p className="text-text-secondary font-medium leading-relaxed">
                        최종 QA, 보안 강화, 마케팅 캠페인 준비 중.
                        규제 샌드박스 승인 대기
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Investors Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6">주요 투자자</h2>
            <p className="text-xl text-text-secondary font-semibold">도파밈과 함께하는 파트너</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <article className="bg-white border-3 border-primary/40 rounded-3xl p-10 hover:border-primary hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    💼
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-primary mb-2">프라이머 사제파트너스</h3>
                    <div className="text-primary font-bold text-sm mb-3">Lead Investor</div>
                    <p className="text-text-secondary text-sm leading-relaxed font-medium">
                      국내 최고의 시드 투자사. 초기 단계 스타트업에 대한 투자 및 멘토링 전문
                    </p>
                  </div>
                </div>
              </article>

              <article className="bg-white border-3 border-secondary/40 rounded-3xl p-10 hover:border-secondary hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-primary mb-2">스파크랩</h3>
                    <div className="text-secondary font-bold text-sm mb-3">Seed Investor</div>
                    <p className="text-text-secondary text-sm leading-relaxed font-medium">
                      글로벌 네트워크를 보유한 액셀러레이터. 해외 진출 및 파트너십 지원
                    </p>
                  </div>
                </div>
              </article>

              <article className="bg-white border-3 border-success/40 rounded-3xl p-10 hover:border-success hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    🌟
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-primary mb-2">본엔젤스벤처파트너스</h3>
                    <div className="text-success font-bold text-sm mb-3">Co-Investor</div>
                    <p className="text-text-secondary text-sm leading-relaxed font-medium">
                      국내 대표 벤처캐피탈. 포트폴리오사 간 시너지 창출 및 후속 투자 지원
                    </p>
                  </div>
                </div>
              </article>

              <article className="bg-white border-3 border-accent-purple/40 rounded-3xl p-10 hover:border-accent-purple hover:shadow-2xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-accent-purple/10 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    👤
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-primary mb-2">엔젤 투자자들</h3>
                    <div className="text-accent-purple font-bold text-sm mb-3">Angel Investors</div>
                    <p className="text-text-secondary text-sm leading-relaxed font-medium">
                      IT 업계 시니어 임원 및 성공한 창업가들의 전략적 투자 및 자문
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-3 border-primary/30 rounded-3xl p-10 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-3xl font-black text-text-primary mb-4">총 투자 유치 규모</h3>
              <div className="text-6xl font-black text-primary mb-2">30억원</div>
              <p className="text-text-secondary font-semibold">
                시드 라운드 (2024년 3월)
              </p>
            </div>
          </div>
        </section>

        {/* Press Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6">언론 보도</h2>
            <p className="text-xl text-text-secondary font-semibold">도파밈에 대한 주요 언론 보도</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <article className="bg-white border-3 border-primary/40 rounded-3xl p-8 hover:border-primary hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-primary text-xs font-black bg-primary/10 px-4 py-2 rounded-full">
                  테크크런치
                </span>
                <time className="text-text-tertiary text-xs font-bold">2024.03</time>
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">
                "도파밈, 게임형 예측 플랫폼으로 30억 투자 유치"
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed font-medium">
                포인트 기반 안전한 예측 시장으로 MZ세대 공략
              </p>
            </article>

            <article className="bg-white border-3 border-secondary/40 rounded-3xl p-8 hover:border-secondary hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-secondary text-xs font-black bg-secondary/10 px-4 py-2 rounded-full">
                  벤처스퀘어
                </span>
                <time className="text-text-tertiary text-xs font-bold">2024.06</time>
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">
                "AI 기반 예측 알고리즘, 정확도 87% 달성"
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed font-medium">
                LMSR 시장 메커니즘으로 공정성 확보
              </p>
            </article>

            <article className="bg-white border-3 border-success/40 rounded-3xl p-8 hover:border-success hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-success text-xs font-black bg-success/10 px-4 py-2 rounded-full">
                  조선비즈
                </span>
                <time className="text-text-tertiary text-xs font-bold">2024.09</time>
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">
                "도파밈 베타 서비스, 출시 1주일 만에 사용자 1천명 돌파"
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed font-medium">
                정식 출시 앞두고 긍정적 반응
              </p>
            </article>

            <article className="bg-white border-3 border-accent-yellow/40 rounded-3xl p-8 hover:border-accent-yellow hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-accent-yellow text-xs font-black bg-accent-yellow/10 px-4 py-2 rounded-full">
                  한국경제
                </span>
                <time className="text-text-tertiary text-xs font-bold">2024.11</time>
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">
                "예측 시장 규제 완화, 도파밈 수혜 전망"
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed font-medium">
                포인트 기반 게임형 모델로 규제 샌드박스 대상
              </p>
            </article>

            <article className="bg-white border-3 border-accent-cyan/40 rounded-3xl p-8 hover:border-accent-cyan hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-accent-cyan text-xs font-black bg-accent-cyan/10 px-4 py-2 rounded-full">
                  매일경제
                </span>
                <time className="text-text-tertiary text-xs font-bold">2024.12</time>
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">
                "집단 지성 활용한 예측 데이터, B2B 시장 진출"
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed font-medium">
                여론 분석 및 트렌드 예측 서비스 준비
              </p>
            </article>

            <article className="bg-white border-3 border-accent-purple/40 rounded-3xl p-8 hover:border-accent-purple hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-accent-purple text-xs font-black bg-accent-purple/10 px-4 py-2 rounded-full">
                  스타트업투데이
                </span>
                <time className="text-text-tertiary text-xs font-bold">2025.01</time>
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">
                "2025년 주목할 스타트업 10선에 도파밈 선정"
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed font-medium">
                게이미피케이션 기반 신규 비즈니스 모델 주목
              </p>
            </article>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6">규제 준수</h2>
            <p className="text-xl text-text-secondary font-semibold">안전하고 투명한 서비스 운영</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-success/5 via-white to-primary/5 border-3 border-success rounded-3xl p-12 mb-8 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center text-3xl">
                  ✅
                </div>
                <h3 className="text-3xl font-black text-text-primary">규제 준수 현황</h3>
              </div>
              <p className="text-xl text-text-secondary leading-relaxed font-semibold mb-6">
                도파밈은 대한민국 법규를 철저히 준수하며, 건전한 예측 게임 문화를 선도합니다.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <article className="bg-white border-3 border-primary/40 rounded-3xl p-8 hover:border-primary hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-2xl">
                    🎮
                  </div>
                  <h3 className="text-xl font-black text-text-primary">게임산업진흥법 준수</h3>
                </div>
                <ul className="space-y-2 text-text-secondary font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>게임용 포인트만 사용 (현금 전환 불가)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>사행성 없는 건전한 게임 설계</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>게임물 등급 분류 신청 완료</span>
                  </li>
                </ul>
              </article>

              <article className="bg-white border-3 border-secondary/40 rounded-3xl p-8 hover:border-secondary hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-2xl">
                    🔒
                  </div>
                  <h3 className="text-xl font-black text-text-primary">개인정보보호법 준수</h3>
                </div>
                <ul className="space-y-2 text-text-secondary font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>개인정보 암호화 저장 및 전송</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>개인정보보호 인증 (ISMS-P) 준비</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>정기 보안 점검 및 취약점 분석</span>
                  </li>
                </ul>
              </article>

              <article className="bg-white border-3 border-success/40 rounded-3xl p-8 hover:border-success hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center text-2xl">
                    ⚖️
                  </div>
                  <h3 className="text-xl font-black text-text-primary">사행성 규제 대응</h3>
                </div>
                <ul className="space-y-2 text-text-secondary font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    <span>포인트의 현금 환전 기능 미제공</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    <span>게임 내 재화 거래 제한</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    <span>공정한 확률 공개 및 투명성 확보</span>
                  </li>
                </ul>
              </article>

              <article className="bg-white border-3 border-accent-cyan/40 rounded-3xl p-8 hover:border-accent-cyan hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent-cyan rounded-xl flex items-center justify-center text-2xl">
                    👶
                  </div>
                  <h3 className="text-xl font-black text-text-primary">청소년 보호법 준수</h3>
                </div>
                <ul className="space-y-2 text-text-secondary font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">•</span>
                    <span>만 19세 이상 성인 인증 필수</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">•</span>
                    <span>본인 확인 시스템 도입</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">•</span>
                    <span>청소년 유해 콘텐츠 차단</span>
                  </li>
                </ul>
              </article>
            </div>

            <div className="bg-gradient-to-br from-accent-purple/5 to-white border-3 border-accent-purple rounded-3xl p-10 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">규제 샌드박스 신청</h3>
              <p className="text-text-secondary leading-relaxed font-medium max-w-2xl mx-auto">
                금융위원회 및 과학기술정보통신부의 규제 샌드박스 제도를 적극 활용하여,
                혁신적인 서비스 모델을 안전하게 검증하고 있습니다.
                2025년 상반기 내 규제 샌드박스 승인을 목표로 준비 중입니다.
              </p>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6">로드맵</h2>
            <p className="text-xl text-text-secondary font-semibold">도파밈의 미래를 함께 만들어갑니다</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* 2025 H1 */}
            <article className="bg-gradient-to-br from-primary/5 to-white border-3 border-primary rounded-3xl p-10 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary text-white px-6 py-2 rounded-full font-black text-sm">
                  2025 상반기
                </div>
              </div>
              <h3 className="text-3xl font-black text-text-primary mb-6">정식 서비스 출시</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span className="text-text-secondary font-medium">정치, 경제, 스포츠 카테고리 예측 마켓 오픈</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span className="text-text-secondary font-medium">모바일 앱 출시 (iOS, Android)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span className="text-text-secondary font-medium">리워드 시스템 및 랭킹 시스템 강화</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span className="text-text-secondary font-medium">사용자 10만명 돌파 목표</span>
                </li>
              </ul>
            </article>

            {/* 2025 H2 */}
            <article className="bg-gradient-to-br from-secondary/5 to-white border-3 border-secondary rounded-3xl p-10 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-secondary text-white px-6 py-2 rounded-full font-black text-sm">
                  2025 하반기
                </div>
              </div>
              <h3 className="text-3xl font-black text-text-primary mb-6">서비스 확장</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-secondary text-xl">→</span>
                  <span className="text-text-secondary font-medium">연예, 게임, 암호화폐 카테고리 추가</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary text-xl">→</span>
                  <span className="text-text-secondary font-medium">AI 기반 맞춤형 예측 추천 기능</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary text-xl">→</span>
                  <span className="text-text-secondary font-medium">커뮤니티 기능 강화 (댓글, 분석글)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary text-xl">→</span>
                  <span className="text-text-secondary font-medium">파트너십 확대 (언론사, 분석 기관)</span>
                </li>
              </ul>
            </article>

            {/* 2026 H1 */}
            <article className="bg-gradient-to-br from-success/5 to-white border-3 border-success rounded-3xl p-10 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-success text-white px-6 py-2 rounded-full font-black text-sm">
                  2026 상반기
                </div>
              </div>
              <h3 className="text-3xl font-black text-text-primary mb-6">글로벌 진출</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">→</span>
                  <span className="text-text-secondary font-medium">영어 서비스 출시 (미국, 유럽 타겟)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">→</span>
                  <span className="text-text-secondary font-medium">글로벌 이슈 예측 마켓 오픈</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">→</span>
                  <span className="text-text-secondary font-medium">B2B 데이터 분석 서비스 출시</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">→</span>
                  <span className="text-text-secondary font-medium">시리즈 A 투자 유치</span>
                </li>
              </ul>
            </article>

            {/* 2026 H2 */}
            <article className="bg-gradient-to-br from-accent-purple/5 to-white border-3 border-accent-purple rounded-3xl p-10 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-accent-purple text-white px-6 py-2 rounded-full font-black text-sm">
                  2026 하반기
                </div>
              </div>
              <h3 className="text-3xl font-black text-text-primary mb-6">플랫폼 생태계 구축</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-accent-purple text-xl">→</span>
                  <span className="text-text-secondary font-medium">사용자 생성 예측 마켓 오픈</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-purple text-xl">→</span>
                  <span className="text-text-secondary font-medium">API 플랫폼 출시 (개발자 에코시스템)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-purple text-xl">→</span>
                  <span className="text-text-secondary font-medium">예측 데이터 마켓플레이스</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-purple text-xl">→</span>
                  <span className="text-text-secondary font-medium">전세계 사용자 100만명 목표</span>
                </li>
              </ul>
            </article>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-text-primary mb-6">핵심 가치</h2>
            <p className="text-xl text-text-secondary font-semibold">도파밈이 지키는 약속</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <article className="bg-white border-3 border-primary/40 rounded-3xl p-10 hover:border-primary hover:shadow-2xl transition-all text-center">
              <div className="text-6xl mb-6">🎮</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">안전한 게임</h3>
              <p className="text-text-secondary leading-relaxed font-medium">
                게임용 포인트만 사용하여 누구나 부담 없이 즐길 수 있는 건전한 예측 문화를 만듭니다.
              </p>
            </article>

            <article className="bg-white border-3 border-secondary/40 rounded-3xl p-10 hover:border-secondary hover:shadow-2xl transition-all text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">투명성</h3>
              <p className="text-text-secondary leading-relaxed font-medium">
                AI 기반 공정한 알고리즘으로 모든 예측 과정이 투명하고 검증 가능합니다.
              </p>
            </article>

            <article className="bg-white border-3 border-success/40 rounded-3xl p-10 hover:border-success hover:shadow-2xl transition-all text-center">
              <div className="text-6xl mb-6">💡</div>
              <h3 className="text-2xl font-black text-text-primary mb-4">집단 지성</h3>
              <p className="text-text-secondary leading-relaxed font-medium">
                사용자들의 예측 데이터를 통해 유의미한 인사이트와 트렌드를 발견합니다.
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-secondary p-16 rounded-3xl shadow-2xl">
            <h2 className="text-5xl font-black text-white mb-6">
              도파밈과 함께 시작하세요
            </h2>
            <p className="text-2xl text-white mb-10 font-bold">
              지금 가입하고 <span className="bg-white text-secondary px-4 py-1 rounded-lg font-black">10,000 DPM</span> 웰컴 보너스를 받아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/app"
                className="inline-block bg-white text-secondary px-16 py-6 rounded-full font-black hover:shadow-2xl hover:scale-105 transition-all text-xl"
              >
                무료로 시작하기 →
              </Link>
              <Link
                href="/"
                className="inline-block bg-white/10 backdrop-blur border-3 border-white text-white px-16 py-6 rounded-full font-black hover:bg-white hover:text-secondary transition-all text-xl"
              >
                더 알아보기
              </Link>
            </div>
          </div>
        </section>
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

            <nav>
              <h4 className="text-text-primary font-black mb-6 text-lg">서비스</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/app" className="text-text-secondary hover:text-primary transition font-semibold">대시보드</Link></li>
                <li><Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">마켓</Link></li>
                <li><Link href="/leaderboard" className="text-text-secondary hover:text-primary transition font-semibold">리더보드</Link></li>
              </ul>
            </nav>

            <nav>
              <h4 className="text-text-primary font-black mb-6 text-lg">정보</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="text-text-secondary hover:text-primary transition font-semibold">소개</Link></li>
                <li><Link href="/terms" className="text-text-secondary hover:text-primary transition font-semibold">이용약관</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-primary transition font-semibold">개인정보처리방침</Link></li>
              </ul>
            </nav>
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
