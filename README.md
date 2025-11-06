# 도파밈 (Dopameme)

<div align="center">
  <h3>🎮 게임처럼 즐기는 예측 플랫폼</h3>
  <p>정치, 경제, 스포츠, 연예 등 실세계 이벤트를 예측하고 도파밈(DPM) 포인트를 획득하세요</p>
</div>

## 📋 프로젝트 소개

도파밈은 대한민국 No.1 이슈 예측 플랫폼으로, 사용자들이 뉴스와 이슈를 단순 소비하는 것을 넘어 적극적으로 자신의 의견을 '예측'이라는 게임을 통해 표현하고 즐기는 새로운 인포테인먼트 플랫폼입니다.

### ✨ 주요 특징

- 🎯 **게임용 포인트 시스템**: 도파밈(DPM) 포인트로 부담 없이 즐기는 예측 게임
- 📊 **다양한 예측 시장**: 정치, 경제, 스포츠, 연예 등 다양한 분야의 이슈 예측
- 🏆 **순위표 시스템**: 예측 실력을 증명하고 순위표 상위권 도전
- 🔐 **안전한 인증**: NextAuth.js 기반 이메일/비밀번호 및 Google OAuth 로그인
- 💾 **타입 안전 DB**: Drizzle ORM과 PostgreSQL 활용
- 🎨 **모던한 디자인**: 빨강과 파랑을 활용한 직관적인 라이트 모드 UI

## 🛠 기술 스택

### Frontend & Backend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

### Authentication
- **NextAuth.js v5**: 세션 기반 인증
- **bcryptjs**: 비밀번호 해싱
- 이메일/비밀번호 & Google OAuth 로그인

### Database
- **PostgreSQL** (Supabase)
- **Drizzle ORM**: 타입 안전 ORM
- **Drizzle Kit**: 마이그레이션 도구

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

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Database (Supabase)
DATABASE_URL=postgresql://...

# NextAuth
AUTH_SECRET=your-auth-secret-key
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
NEXTAUTH_URL=http://localhost:3000
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
│   ├── about/                           # 소개 페이지
│   ├── admin/
│   │   └── markets/[id]/
│   │       ├── toggle-hidden/actions.ts # 예측 가리기/보이기
│   │       └── delete/actions.ts        # 예측 삭제
│   ├── api/auth/[...nextauth]/         # NextAuth API 라우트
│   ├── app/                             # 내 활동 페이지
│   ├── leaderboard/                     # 순위표
│   ├── login/                           # 로그인
│   ├── markets/                         # 예측 시장 목록
│   │   └── [id]/                        # 예측 상세 페이지
│   │       └── ToggleHiddenButton.tsx   # 관리자 버튼
│   ├── privacy/                         # 개인정보처리방침
│   ├── signup/                          # 회원가입
│   ├── terms/                           # 이용약관
│   ├── globals.css                      # 전역 스타일
│   ├── icon.svg                         # 파비콘
│   ├── layout.tsx                       # 루트 레이아웃
│   ├── opengraph-image.tsx              # OG 이미지
│   └── page.tsx                         # 랜딩페이지
├── components/
│   ├── Header.tsx                       # 재사용 가능한 헤더
│   ├── LogoutButton.tsx                 # 로그아웃 버튼
│   └── ...
├── lib/
│   ├── db/
│   │   ├── schema.ts                    # Drizzle 스키마
│   │   └── index.ts                     # DB 연결
│   ├── auth-utils.ts                    # 인증 유틸리티
│   └── nickname-generator.ts            # 닉네임 생성기
├── scripts/
│   ├── generate-100-historical-markets.sql  # 히스토리컬 마켓 생성
│   ├── add-hidden-column.sql                # hidden 컬럼 추가
│   └── ...
├── auth.ts                              # NextAuth 설정
├── middleware.ts                        # 인증 미들웨어
├── tailwind.config.ts                   # Tailwind 설정
├── tsconfig.json                        # TypeScript 설정
└── package.json
```

## 📄 페이지

### 공개 페이지
- **`/`**: 랜딩페이지 (히어로, 기능 소개, 뉴스, 사용법, CTA)
- **`/about`**: 소개 페이지 (창립자, 히스토리, 투자자, 언론 보도, 규제 준수, 로드맵)
- **`/terms`**: 이용약관
- **`/privacy`**: 개인정보처리방침
- **`/login`**: 로그인 (이메일/비밀번호, Google OAuth)
- **`/signup`**: 회원가입 (10,000 DPM 웰컴 보너스)

### 인증 필요 페이지
- **`/app`**: 내 활동 (내 예측, 포인트 내역, 통계)
- **`/markets`**: 예측 시장 목록 (카테고리별 필터링)
- **`/markets/[id]`**: 예측 상세 (베팅, 통계, 예측 참여)
- **`/leaderboard`**: 순위표 (전체 유저 순위)

## 🎨 디자인 시스템

### 헤더

- 도파밈 로고 (개별 글자 컬러: 도-파랑, 파-빨강, 밈-파랑)
- 로그인 후: DPM 포인트 표시 + "내 활동" 버튼 + "로그아웃" 버튼
- 로그인 전: "로그인" 링크 + "회원가입" 버튼
- Sticky 헤더, 그림자 효과
- 모든 페이지에 재사용 가능한 `<Header />` 컴포넌트 사용

### 푸터

- 3컬럼 레이아웃: 로고/설명, 서비스 메뉴, 정보 메뉴
- 하단: 저작권 표시
- 용어: 내 활동, 예측 시장, 순위표, 도파밈 소개

## ⚡ 핵심 기능

### 예측 시장
- **다양한 카테고리**: 정치, 경제, 스포츠, 연예, 사회, 과학기술, 국제 등
- **실시간 확률 업데이트**: 베팅에 따라 동적으로 변하는 확률
- **예측 참여**: DPM 포인트로 YES/NO에 베팅
- **예측 결과 해결**: 관리자가 실제 결과에 따라 시장 종료
- **수수료 시스템**: 예측 당첨 시 1% 플랫폼 수수료

### 사용자 시스템
- **회원가입**: 이메일/비밀번호 또는 Google OAuth
- **웰컴 보너스**: 신규 가입 시 10,000 DPM 지급
- **자동 닉네임 생성**: 랜덤 닉네임 자동 생성 (수정 가능)
- **포인트 관리**: DPM 잔액 추적 및 거래 내역
- **순위표**: 전체 사용자 순위 및 통계

### 관리자 기능
- **예측 생성**: 새로운 예측 시장 생성
- **예측 해결**: 실제 결과에 따라 시장 종료 및 보상 분배
- **예측 가리기**: 문제가 있는 예측 숨기기 (관리자만 보임)
- **예측 삭제**: 가려진 예측만 삭제 가능 (안전장치)
- **관리자 배지**: 관리자 계정 시각적 표시 (🔑)

### 데이터베이스 스키마

**users 테이블**
- id, name, email, password, image, role, dpmBalance
- Google OAuth 지원
- 역할 기반 접근 제어 (user/admin)

**markets 테이블**
- id, question, category, endDate, resolved, resolvedAt
- hidden (관리자 가리기 기능)
- YES/NO 옵션 확률 및 베팅 총액

**predictions 테이블**
- id, userId, marketId, optionId, amount
- 사용자 예측 기록 및 베팅 금액

### 테스트 데이터
- **100개의 테스트 계정**: test1@test.com ~ test100@test.com (비밀번호: test1234)
- **100개 이상의 히스토리컬 마켓**: 과거 이벤트 기반 예측 시장
- **각 계정 50+ 예측 참여**: 리얼리스틱한 시장 활동 시뮬레이션

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
