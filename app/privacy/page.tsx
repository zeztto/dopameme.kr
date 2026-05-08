import Link from "next/link";
import Header from "@/components/Header";

export default async function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          개인정보처리방침
        </h1>
        <p className="text-gray-600 mb-12">시행일: 2025년 1월 1일</p>

        <div className="space-y-12">
          {/* Introduction */}
          <section className="bg-blue-50 border border-primary/30 rounded-xl p-8">
            <p className="text-gray-700 leading-relaxed">
              도파밈(이하 "회사"라 합니다)은 이용자의 개인정보를 중요시하며,
              「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등
              관련 법령을 준수하고 있습니다. 회사는 본 개인정보처리방침을 통하여 이용자가 제공하는
              개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가
              취해지고 있는지 알려드립니다.
            </p>
          </section>

          {/* Article 1 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              제1조 (수집하는 개인정보의 항목 및 수집방법)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. 수집하는 개인정보의 항목</h3>
                <p className="mb-2">회사는 회원가입, 서비스 제공 등을 위해 아래와 같은 개인정보를 수집하고 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <span className="font-semibold text-primary">필수항목:</span> 이메일 주소, 비밀번호, 닉네임, 생년월일
                  </li>
                  <li>
                    <span className="font-semibold text-primary">선택항목:</span> 프로필 이미지
                  </li>
                  <li>
                    <span className="font-semibold text-primary">자동 수집 항목:</span> IP 주소, 쿠키, 서비스 이용 기록,
                    접속 로그, 기기 정보
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. 개인정보 수집방법</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>홈페이지 및 애플리케이션을 통한 회원가입</li>
                  <li>소셜 로그인(Google, Kakao 등)을 통한 회원가입</li>
                  <li>서비스 이용 과정에서 자동 수집</li>
                  <li>고객센터를 통한 상담 과정에서 수집</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 2 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              제2조 (개인정보의 수집 및 이용목적)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:</p>
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>
                  <span className="font-semibold text-gray-900">회원 관리:</span>
                  회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지,
                  가입 의사 확인, 연령확인, 만 14세 미만 아동 개인정보 수집 시 법정 대리인 동의여부 확인
                </li>
                <li>
                  <span className="font-semibold text-gray-900">서비스 제공:</span>
                  예측 게임 서비스 제공, 도파밈 포인트 관리, 마켓 참여 내역 관리,
                  랭킹 및 리더보드 제공, 맞춤형 서비스 제공
                </li>
                <li>
                  <span className="font-semibold text-gray-900">마케팅 및 광고:</span>
                  신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공
                </li>
                <li>
                  <span className="font-semibold text-gray-900">서비스 개선:</span>
                  서비스 이용 통계 분석, 서비스 품질 개선
                </li>
              </ol>
            </div>
          </section>

          {/* Article 3 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              제3조 (개인정보의 보유 및 이용기간)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>
                  회사는 회원가입일로부터 서비스를 제공하는 기간 동안에 한하여 이용자의 개인정보를 보유 및 이용하게 됩니다.
                </li>
                <li>
                  회원 탈퇴를 요청하거나 개인정보의 수집 및 이용에 대한 동의를 철회하는 경우,
                  수집 및 이용목적이 달성되거나 보유 및 이용기간이 종료한 경우 해당 개인정보를
                  지체없이 파기합니다.
                </li>
                <li>
                  단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>
                      <span className="font-semibold">부정 이용 방지:</span>
                      부정이용 기록(부정가입, 징계기록 등) - 1년
                    </li>
                    <li>
                      <span className="font-semibold">전자상거래법:</span>
                      계약 또는 청약철회 등에 관한 기록 - 5년
                    </li>
                    <li>
                      <span className="font-semibold">전자상거래법:</span>
                      대금결제 및 재화 등의 공급에 관한 기록 - 5년
                    </li>
                    <li>
                      <span className="font-semibold">전자상거래법:</span>
                      소비자의 불만 또는 분쟁처리에 관한 기록 - 3년
                    </li>
                    <li>
                      <span className="font-semibold">통신비밀보호법:</span>
                      로그인 기록 - 3개월
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </section>

          {/* Article 4 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              제4조 (개인정보의 파기절차 및 방법)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다.</p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">파기절차</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>회원이 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져
                    내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.</li>
                  <li>별도 DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는
                    보유 목적 이외의 다른 목적으로 이용되지 않습니다.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">파기방법</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
                  <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 5 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              제5조 (개인정보의 제3자 제공)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                회사는 원칙적으로 이용자의 개인정보를 제1조(개인정보의 수집 및 이용목적)에서
                명시한 범위 내에서 사용하며, 이용자의 사전 동의 없이는 동 범위를 초과하여
                이용하거나 제3자에게 제공하지 않습니다.
              </p>
              <p>
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라
                  수사기관의 요구가 있는 경우</li>
              </ul>
            </div>
          </section>

          {/* Article 6 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              제6조 (개인정보의 안전성 확보조치)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>
                  <span className="font-semibold text-gray-900">관리적 조치:</span>
                  내부관리계획 수립 및 시행, 정기적 직원 교육
                </li>
                <li>
                  <span className="font-semibold text-gray-900">기술적 조치:</span>
                  개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치,
                  고유식별정보 등의 암호화, 보안프로그램 설치
                </li>
                <li>
                  <span className="font-semibold text-gray-900">물리적 조치:</span>
                  전산실, 자료보관실 등의 접근통제
                </li>
              </ol>
            </div>
          </section>

          {/* Article 7 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              제7조 (이용자의 권리와 그 행사방법)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>
                  이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며,
                  가입해지(동의철회)를 요청할 수도 있습니다.
                </li>
                <li>
                  이용자의 개인정보 조회, 수정을 위해서는 '개인정보변경'(또는 '회원정보수정' 등)을,
                  가입해지(동의철회)를 위해서는 "회원탈퇴"를 클릭하여 본인 확인 절차를 거치신 후
                  직접 열람, 정정 또는 탈퇴가 가능합니다.
                </li>
                <li>
                  개인정보보호책임자에게 서면, 전화 또는 이메일로 연락하시면 지체없이 조치하겠습니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Article 8 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              제8조 (쿠키의 운영 및 거부)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>
                  회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고
                  수시로 불러오는 '쿠키(cookie)'를 사용합니다.
                </li>
                <li>
                  쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게
                  보내는 소량의 정보이며 이용자의 PC 컴퓨터내의 하드디스크에 저장되기도 합니다.
                </li>
                <li>
                  이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다.
                  따라서, 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나,
                  쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Article 9 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              제9조 (개인정보보호책임자)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여
                아래와 같이 개인정보보호책임자를 지정하고 있습니다:</p>

              <div className="bg-gray-50 border border-primary/30 rounded-lg p-6 mt-4">
                <h3 className="text-lg font-semibold text-primary mb-3">개인정보보호책임자</h3>
                <ul className="space-y-2">
                  <li><span className="font-semibold text-gray-900">성명:</span> 제트</li>
                  <li><span className="font-semibold text-gray-900">직책:</span> CFO</li>
                  <li><span className="font-semibold text-gray-900">이메일:</span> zett@dopameme.kr</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 10 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              제10조 (개인정보처리방침의 변경)
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>
                  본 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.
                </li>
                <li>
                  개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는
                  개정 최소 7일 전부터 홈페이지의 '공지사항'을 통해 고지할 것입니다.
                </li>
              </ol>
            </div>
          </section>
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
