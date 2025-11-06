# 도파밈 (Dopameme)

<div align="center">
  <h3>🎮 게임처럼 즐기는 예측 플랫폼</h3>
  <p>정치, 경제, 스포츠, 연예 등 실세계 이벤트를 예측하고 도파밈(DPM) 포인트를 획득하세요</p>
</div>

## 📋 프로젝트 소개

도파밈은 대한민국 No.1 이슈 예측 플랫폼으로, 사용자들이 뉴스와 이슈를 단순 소비하는 것을 넘어 적극적으로 자신의 의견을 '예측'이라는 게임을 통해 표현하고 즐기는 새로운 인포테인먼트 플랫폼입니다.

### ✨ 주요 특징

- 🎯 **게임용 포인트 시스템**: 도파밈(DPM) 포인트로 부담 없이 즐기는 예측 게임
- 📊 **다양한 예측 마켓**: 정치, 경제, 스포츠, 연예 등 다양한 분야의 이슈 예측
- 🏆 **랭킹 시스템**: 예측 실력을 증명하고 리더보드 상위권 도전
- 🤖 **AI 기반 알고리즘**: LMSR(Logarithmic Market Scoring Rule) 알고리즘 적용
- 🎨 **모던한 디자인**: 빨강과 파랑을 활용한 직관적인 라이트 모드 UI

## 🛠 기술 스택

- **Framework**: [Next.js 15.5.6](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Package Manager**: npm

### 컬러 팔레트

- **Primary (파랑)**: `#2563EB`
- **Secondary (빨강)**: `#DC2626`
- **Success (초록)**: `#10B981`
- **Accent Colors**: Yellow, Gold, Cyan, Purple

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/dopameme.kr.git

# 프로젝트 디렉토리 이동
cd dopameme.kr

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
dopameme.kr/
├── app/
│   ├── about/              # 소개 페이지
│   │   └── page.tsx
│   ├── privacy/            # 개인정보처리방침
│   │   └── page.tsx
│   ├── terms/              # 이용약관
│   │   └── page.tsx
│   ├── globals.css         # 전역 스타일
│   ├── icon.svg            # 파비콘
│   ├── layout.tsx          # 루트 레이아웃
│   ├── opengraph-image.tsx # OG 이미지
│   └── page.tsx            # 랜딩페이지
├── tailwind.config.ts      # Tailwind 설정
├── tsconfig.json           # TypeScript 설정
└── package.json
```

## 📄 페이지

- **`/`**: 랜딩페이지 (히어로, 기능 소개, 뉴스, 사용법, CTA)
- **`/about`**: 소개 페이지 (창립자, 히스토리, 투자자, 언론 보도, 규제 준수, 로드맵)
- **`/terms`**: 이용약관
- **`/privacy`**: 개인정보처리방침

## 🎨 디자인 시스템

### 헤더

- 도파밈 로고 (개별 글자 컬러: 도-파랑, 파-빨강, 밈-파랑)
- 우측: "대시보드" 링크 + "로그인" 버튼
- Sticky 헤더, 그림자 효과

### 푸터

- 3컬럼 레이아웃: 로고/설명, 서비스 메뉴, 정보 메뉴
- 하단: 저작권 표시 + 포인트 안내 문구

## 🔍 SEO 최적화

- 메타데이터 설정 (title, description, keywords)
- Open Graph 이미지 동적 생성
- Twitter Cards 지원
- 시맨틱 HTML 태그 사용
- 검색 엔진 최적화 (robots.txt, sitemap)

## 👥 팀

- **CEO**: 레온 스카이
- **CTO**: 밈쭌
- **CPO**: 강블리
- **CFO**: 제트 (zett@dopameme.kr)

## 💰 투자

- **리드 투자사**: 프라이머 사제파트너스
- **참여사**: 스파크랩, 본엔젤스벤처파트너스
- **2024년 3월**: 30억원 시드 투자 유치

## 📈 시장 데이터

- **글로벌 시장 규모**: $580B
- **연평균 성장률**: 23.4%
- **AI 예측 정확도**: 87%
- **전세계 사용자**: 150M+

## 📝 라이선스

© 2025 도파밈. All rights reserved.

---

<div align="center">
  <p>도파밈은 게임용 포인트를 사용하는 예측 플랫폼입니다.</p>
  <p>Made with ❤️ by Dopameme Team</p>
</div>
