# 도파밈 (Dopameme)

<div align="center">
  <h3>🎮 게임처럼 즐기는 예측 플랫폼</h3>
  <p>정치, 경제, 스포츠, 연예 등 실세계 이벤트를 예측하고 도파밈(DPMM) 포인트를 획득하세요</p>
</div>

---

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

---

## 📚 프로젝트 문서

모든 상세 문서는 `docs` 폴더에서 확인할 수 있습니다:

### 주요 문서

- **[종합 문서](./docs/DOCUMENTATION.md)** - 프로젝트 전체 개요, 기술 아키텍처, 개발 가이드
- **[화면 기획서](./docs/WIREFRAME.md)** - 전체 페이지별 상세 Text Wireframe
- **[기획서](./docs/dopameme_plan.md)** - 비즈니스 기획 및 서비스 정의
- **[개발 계획서](./docs/dopameme_dev.md)** - MVP 개발 로드맵 및 기술 스택

### 문서 구조

```
docs/
├── DOCUMENTATION.md        # 📖 종합 프로젝트 문서
├── WIREFRAME.md           # 🎨 화면 기획서 (Text Wireframe)
├── dopameme_plan.md       # 📋 비즈니스 기획서
└── dopameme_dev.md        # 🛠 개발 계획서
```

---

## 📋 프로젝트 개요

도파밈은 사용자들이 정치, 경제, 스포츠, 연예 등 실세계 이벤트의 결과를 예측하고, 게임용 포인트(DPMM)를 사용하여 참여하는 소셜 예측 게임 플랫폼입니다.

### ✨ 주요 특징

- 🎯 **게임용 포인트 시스템**: 도파밈(DPMM) 포인트로 부담 없이 즐기는 예측 게임
- 📊 **다양한 예측 시장**: 정치, 경제, 스포츠, 연예 등 다양한 분야의 이슈 예측
- 🏆 **순위표 시스템**: 예측 실력을 증명하고 순위표 상위권 도전
- 🔐 **안전한 인증**: NextAuth.js 기반 이메일/비밀번호 및 Google OAuth 로그인
- 💾 **타입 안전 DB**: Drizzle ORM과 PostgreSQL 활용

---

## 🛠 기술 스택

### Frontend & Backend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4

### Authentication
- **NextAuth.js v5**: 세션 기반 인증
- **bcryptjs**: 비밀번호 해싱
- 이메일/비밀번호 & Google OAuth 로그인

### Database
- **PostgreSQL** (Supabase)
- **Drizzle ORM**: 타입 안전 ORM
- **Drizzle Kit**: 마이그레이션 도구

### Deployment
- **Hosting**: Vercel
- **Domain**: dopameme.kr

---

## 📁 프로젝트 구조

```
dopameme.kr/
├── app/                    # Next.js App Router
│   ├── about/             # 소개 페이지
│   ├── admin/             # 관리자 기능
│   ├── api/auth/          # NextAuth API
│   ├── app/               # 내 활동 페이지
│   ├── leaderboard/       # 순위표
│   ├── login/             # 로그인
│   ├── markets/           # 예측 시장
│   ├── privacy/           # 개인정보처리방침
│   ├── signup/            # 회원가입
│   ├── terms/             # 이용약관
│   └── page.tsx           # 랜딩 페이지
├── components/            # 재사용 가능 컴포넌트
├── lib/                   # 유틸리티 라이브러리
├── scripts/               # DB 스크립트
├── docs/                  # 📚 프로젝트 문서
└── ...
```

---

## 🎨 디자인 시스템

### 컬러 팔레트

- **Primary (파랑)**: `#2563EB`
- **Secondary (빨강)**: `#DC2626`
- **Success (초록)**: `#10B981`

자세한 디자인 가이드는 [화면 기획서](./docs/WIREFRAME.md)를 참고하세요.

---

## 📄 주요 페이지

### 공개 페이지
- `/` - 랜딩페이지
- `/about` - 소개 페이지
- `/login` - 로그인
- `/signup` - 회원가입 (10,000 DPMM 웰컴 보너스)

### 인증 필요 페이지
- `/app` - 내 활동 (내 예측, 포인트 내역, 통계)
- `/markets` - 예측 시장 목록
- `/markets/[id]` - 예측 상세
- `/leaderboard` - 순위표

### 관리자 페이지
- `/admin/markets/create` - 마켓 생성
- `/admin/markets/[id]/resolve` - 결과 확정

---

## ⚡ 핵심 기능

### 예측 시스템
- 다양한 카테고리의 예측 마켓
- 실시간 확률 업데이트
- DPMM 포인트로 예측 참여
- 1% 플랫폼 수수료

### 사용자 시스템
- 이메일/비밀번호 또는 Google OAuth 로그인
- 신규 가입 시 10,000 DPMM 웰컴 보너스
- 자동 닉네임 생성
- 순위표

### 관리자 기능
- 예측 마켓 생성
- 결과 확정 및 보상 분배
- 마켓 가리기/삭제

---

## 🔧 환경 설정

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

---

## 📈 개발 로드맵

- ✅ **Phase 1**: MVP 출시 (완료)
- 🔄 **Phase 2**: 커뮤니티 기능 (Q1 2025)
- 📅 **Phase 3**: 고급 기능 (Q2 2025)
- 📅 **Phase 4**: 데이터 분석 (Q3 2025)

자세한 로드맵은 [종합 문서](./docs/DOCUMENTATION.md#10-향후-로드맵)를 참고하세요.

---

## 👥 팀

- **CEO**: 레온 스카이
- **CTO**: 밈쭌
- **CPO**: 강블리
- **CFO**: 제트 (zett@dopameme.kr)

---

## 💰 투자

- **리드 투자사**: 프라이머 사제파트너스
- **참여사**: 스파크랩, 본엔젤스벤처파트너스
- **2024년 3월**: 30억원 시드 투자 유치

---

## 📝 라이선스

© 2025 도파밈. All rights reserved.

---

<div align="center">
  <p>도파밈은 게임용 포인트를 사용하는 예측 플랫폼입니다.</p>
  <p>Made with ❤️ by Dopameme Team</p>
</div>
