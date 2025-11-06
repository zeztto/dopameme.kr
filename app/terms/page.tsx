import Link from "next/link";
import { auth } from "@/auth";
import Header from "@/components/Header";

export default async function TermsPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          이용약관
        </h1>
        <p className="text-gray-600 mb-12">시행일: 2025년 1월 1일</p>

        <div className="space-y-12">
          {/* Article 1 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">제1조 (목적)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                본 약관은 도파밈(이하 "회사"라 합니다)이 제공하는 도파밈 서비스(이하 "서비스"라 합니다)의
                이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">제2조 (정의)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  "서비스"란 회사가 제공하는 예측 게임 플랫폼 및 관련 제반 서비스를 의미합니다.
                </li>
                <li>
                  "회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.
                </li>
                <li>
                  "도파밈(DPMM)"이란 서비스 내에서 사용되는 게임용 포인트로, 현금으로 환전되거나
                  외부로 전송될 수 없는 가상의 재화를 의미합니다.
                </li>
                <li>
                  "마켓"이란 특정 이슈나 이벤트의 결과를 예측하기 위해 생성된 예측 시장을 의미합니다.
                </li>
                <li>
                  "지분"이란 마켓에서 특정 결과(Yes 또는 No)에 대해 회원이 구매한 예측 단위를 의미합니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Article 3 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">제3조 (약관의 효력 및 변경)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.
                </li>
                <li>
                  회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며,
                  변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력이 발생합니다.
                </li>
                <li>
                  회원은 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 이용계약을 해지할 수 있습니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Article 4 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">제4조 (회원가입)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  회원가입은 이용자가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고
                  회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                </li>
                <li>
                  회원가입 신청자는 만 14세 이상이어야 하며, 실명 및 실제 정보를 기재하여야 합니다.
                </li>
                <li>
                  회사는 다음 각 호에 해당하는 경우 회원가입을 승낙하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                    <li>허위의 정보를 기재하거나 회사가 요구하는 정보를 제공하지 않은 경우</li>
                    <li>만 14세 미만인 경우</li>
                    <li>이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반한 경우</li>
                  </ul>
                </li>
              </ol>
            </div>
          </section>

          {/* Article 5 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">제5조 (도파밈 포인트)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  도파밈(DPMM)은 서비스 내에서만 사용 가능한 게임용 포인트이며,
                  <span className="text-secondary font-semibold"> 현금으로 환전하거나 외부로 전송할 수 없습니다.</span>
                </li>
                <li>
                  회원은 다음의 방법으로 도파밈을 획득할 수 있습니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>신규 회원가입 시 웰컴 보너스</li>
                    <li>일일 출석체크</li>
                    <li>예측 게임 참여</li>
                    <li>예측 성공 시 보상</li>
                    <li>커뮤니티 활동</li>
                    <li>친구 초대 리워드</li>
                  </ul>
                </li>
                <li>
                  도파밈은 마켓에서 지분을 구매하거나 서비스 내 아이템을 구매하는 데 사용할 수 있습니다.
                </li>
                <li>
                  회사는 서비스 정책에 따라 도파밈의 획득 및 사용 조건을 변경할 수 있으며,
                  변경 시 사전에 공지합니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Article 6 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">제6조 (예측 게임 이용)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  회원은 마켓에서 도파밈을 사용하여 특정 결과(Yes 또는 No)에 대한 지분을 구매할 수 있습니다.
                </li>
                <li>
                  마켓의 가격은 시장 참여자들의 수요와 공급에 따라 실시간으로 변동됩니다.
                </li>
                <li>
                  마켓이 종료되고 결과가 확정되면, 정답을 예측한 회원은 보유한 지분에 따라 도파밈을 지급받습니다.
                </li>
                <li>
                  회원은 부정한 방법으로 예측 게임에 참여하거나 시스템을 악용해서는 안 됩니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Article 7 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">제7조 (회원의 의무)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>회원은 다음 행위를 하여서는 안 됩니다:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>신청 또는 변경 시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>부정한 방법으로 도파밈을 획득하거나 시스템을 악용하는 행위</li>
              </ol>
            </div>
          </section>

          {/* Article 8 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">제8조 (서비스의 제공 및 변경)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  회사는 회원에게 다양한 예측 게임 서비스를 제공합니다.
                </li>
                <li>
                  회사는 서비스의 내용을 변경할 경우 변경사항을 사전에 공지합니다.
                </li>
                <li>
                  회사는 다음의 경우 서비스의 전부 또는 일부를 제한하거나 중단할 수 있습니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>서비스용 설비의 보수 또는 공사로 인한 부득이한 경우</li>
                    <li>천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
                    <li>서비스 제공의 기술상 문제가 있는 경우</li>
                  </ul>
                </li>
              </ol>
            </div>
          </section>

          {/* Article 9 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">제9조 (면책조항)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                  서비스 제공에 관한 책임이 면제됩니다.
                </li>
                <li>
                  회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
                </li>
                <li>
                  회사는 회원이 서비스를 이용하여 기대하는 수익을 얻지 못하거나 상실한 것에 대하여 책임을 지지 않습니다.
                </li>
                <li>
                  회사는 회원이 게재한 정보, 자료, 사실의 신뢰도, 정확성 등에 대해서는 책임을 지지 않습니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Article 10 */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">제10조 (준거법 및 재판관할)</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  회사와 회원 간 제기된 소송은 대한민국 법을 준거법으로 합니다.
                </li>
                <li>
                  회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.
                </li>
              </ol>
            </div>
          </section>

          {/* Supplementary Provisions */}
          <section className="bg-blue-50 border border-primary/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
            <p className="text-gray-700">
              본 약관은 2025년 1월 1일부터 시행됩니다.
            </p>
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
