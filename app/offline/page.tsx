import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "오프라인",
  description: "네트워크 연결이 없을 때 표시되는 도파밈 안내 페이지입니다.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-light-bg">
      <Header isAuthenticated={false} />

      <main className="container mx-auto px-4 py-16">
        <section className="mx-auto max-w-3xl rounded-dopameme border-2 border-light-border bg-white p-8 shadow-token-lg">
          <div className="mb-6 inline-flex rounded-dopameme-pill bg-primary/10 px-4 py-2 text-sm font-black text-primary">
            Offline
          </div>
          <h1 className="mb-4 text-3xl font-black text-text-primary sm:text-4xl">
            현재 오프라인 상태입니다
          </h1>
          <p className="mb-8 text-lg leading-8 text-text-secondary">
            네트워크 연결이 복구되면 마켓, 내 활동, 지갑 정보를 다시 불러올 수 있습니다.
            이 화면은 모바일 설치 환경에서도 기본 안내가 보이도록 캐시됩니다.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/"
              className="rounded-dopameme bg-primary px-6 py-4 text-center font-black text-white transition hover:bg-primary-dark"
            >
              홈으로 이동
            </Link>
            <Link
              href="/markets"
              className="rounded-dopameme border-2 border-primary px-6 py-4 text-center font-black text-primary transition hover:bg-primary hover:text-white"
            >
              마켓 다시 열기
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
