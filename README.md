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
- 💾 **타입 안전 DB**: Prisma ORM과 PostgreSQL 활용

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
- **PostgreSQL** (Docker Compose)
- **Prisma ORM**: 타입 안전 ORM 및 마이그레이션
- **DPMM Ledger**: 모든 장부 잔액 증감을 append-only transaction으로 기록

### Web3
- **Solana devnet**: DPMM Token-2022 mint 연결
- **Wallet signing**: nonce 기반 외부 지갑 주소 검증
- **Withdrawals**: 장부 DPMM 출금 요청 및 관리자 수동 전송 기록

### Deployment
- **Hosting**: Vultr (`p1zza-2nd`)
- **Runtime**: Docker Compose
- **Reverse Proxy**: Caddy
- **CI/CD**: p1zza-1st self-hosted runner
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
├── prisma/                # Prisma schema 및 migrations
├── infra/caddy/           # Caddy reverse proxy 설정
├── scripts/               # DB 스크립트
├── docs/                  # 📚 프로젝트 문서
├── Dockerfile             # Production Docker image
├── compose.yml            # Vultr 배포용 Docker Compose
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
- `/app` - 내 활동 (실제 예측 통계, 랭킹, 최근 예측, DPMM ledger)
- `/app/wallet` - Solana DPMM 지갑 연결 및 on-chain 잔액 조회
- `/markets` - 예측 시장 목록
- `/markets/[id]` - 예측 상세
- `/leaderboard` - 순위표

### 관리자 페이지
- `/admin` - 운영 대시보드
- `/admin/markets` - 마켓 관리
- `/admin/markets/create` - 마켓 생성
- `/admin/users` - 회원 관리
- `/admin/users/[id]` - 회원 상세 및 DPMM ledger 조회
- `/admin/withdrawals` - DPMM 출금 요청 관리

---

## ⚡ 핵심 기능

### 예측 시스템
- 다양한 카테고리의 예측 마켓
- 실시간 확률 업데이트
- DPMM 포인트로 예측 참여
- 1% 플랫폼 수수료
- 예측 참여, 정산, 출금, 관리자 조정을 DPMM ledger로 추적

### 사용자 시스템
- 이메일/비밀번호 또는 Google OAuth 로그인
- 신규 가입 시 10,000 DPMM 웰컴 보너스
- 자동 닉네임 생성
- 순위표
- Solana devnet DPMM 지갑 연결 및 on-chain 잔액 조회
- 장부 DPMM 출금 요청

### 관리자 기능
- 예측 마켓 생성
- 결과 확정 및 보상 분배
- 마켓 가리기/삭제
- 회원 권한/상태 관리
- 회원 DPMM 잔액 조정 및 상세 ledger 이력 조회
- DPMM 출금 요청 승인/거절 및 transaction signature 기록

---

## 🔧 환경 설정

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://...
POSTGRES_DB=dopameme
POSTGRES_USER=dopameme
POSTGRES_PASSWORD=...

# NextAuth
AUTH_SECRET=your-auth-secret-key
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
SEED_ADMIN_EMAIL=admin@dopameme.kr
SEED_ADMIN_PASSWORD=strong-admin-password
SEED_ADMIN_NAME=dopameme-admin
SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
DPMM_MINT_ADDRESS=6fQ3D623QNsskcsdwHvUNgutFp1ptbQWUAYSoLFZTeyc
DPMM_TOKEN_PROGRAM=token-2022
DPMM_DECIMALS=9
DPMM_MIN_WITHDRAWAL_AMOUNT=1000
DPMM_TREASURY_WALLET_ADDRESS=
```

`DATABASE_URL`에 특수문자가 포함된 비밀번호를 넣는 경우 URL percent-encoding을 적용하세요.

Docker/Vultr 배포 절차는 [배포 문서](./docs/DEPLOYMENT.md)를 참고하세요.

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
