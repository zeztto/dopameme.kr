import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "도파밈 - 세상의 모든 이슈 예측하고 즐겨라",
    template: "%s | 도파밈"
  },
  description: "정치, 경제, 스포츠, 연예 등 실세계 이벤트를 예측하고 도파밈(DPMM) 포인트를 획득하세요. AI 기반 예측 알고리즘과 게이미피케이션으로 즐기는 대한민국 No.1 소셜 예측 게임 플랫폼입니다.",
  keywords: ["예측 게임", "예측 시장", "도파밈", "DPMM", "베팅 게임", "예측 플랫폼", "이슈 예측", "소셜 게임", "포인트 게임", "정치 예측", "경제 예측", "스포츠 예측"],
  authors: [{ name: "도파밈" }],
  creator: "도파밈",
  publisher: "도파밈",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dopameme.kr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://dopameme.kr',
    siteName: '도파밈',
    title: '도파밈 - 세상의 모든 이슈 예측하고 즐겨라',
    description: '정치, 경제, 스포츠, 연예 등 실세계 이벤트를 예측하고 도파밈(DPMM) 포인트를 획득하세요. 게임처럼 즐기는 대한민국 No.1 예측 플랫폼입니다.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: '도파밈 - 세상의 모든 이슈 예측하고 즐겨라',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '도파밈 - 세상의 모든 이슈 예측하고 즐겨라',
    description: '정치, 경제, 스포츠, 연예 등 실세계 이벤트를 예측하고 도파밈(DPMM) 포인트를 획득하세요.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    // other: {
    //   'naver-site-verification': 'naver-verification-code',
    // },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
