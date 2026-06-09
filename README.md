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

# 운영/로컬 smoke test
npm run smoke -- --base-url https://dopameme.kr
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
- 🌐 **다국어 진입 경험**: 한국어/영어/일본어 locale 전환과 랜딩 페이지 현지화
- 🌎 **현지화 콘텐츠 탐색**: locale별 마켓/auth chrome, 카테고리/지역 label, 현지 콘텐츠 우선 노출
- 🔎 **검색 친화 공개 진입면**: sitemap/robots, canonical metadata, JSON-LD 기반 공개 route 크롤링 정책

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
- **Security Headers**: Next standalone 서버 공통 보안 헤더, cookie-locale HTML route no-store, private route noindex, service worker 캐시 갱신 정책

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
│   ├── api/b2b/           # B2B aggregate analytics API
│   ├── api/auth/          # NextAuth API
│   ├── api/webauthn/      # WebAuthn/passkey API
│   ├── app/               # 내 활동, AI 추천, 트렌드 예측, 업적, 레벨, 시즌, 아이템샵, 통계 페이지
│   ├── feed/              # 활동 피드
│   ├── leaderboard/       # 순위표
│   ├── locale/            # locale cookie 설정 Server Action
│   ├── login/             # 로그인
│   ├── markets/           # 예측 시장
│   ├── notifications/     # 알림함
│   ├── offline/           # PWA 오프라인 fallback
│   ├── privacy/           # 개인정보처리방침
│   ├── signup/            # 회원가입
│   ├── terms/             # 이용약관
│   ├── manifest.ts        # 모바일 설치용 web app manifest
│   └── page.tsx           # 랜딩 페이지
├── components/            # 재사용 가능 컴포넌트
├── lib/                   # 유틸리티 라이브러리, i18n copy/locale helper
├── mobile/                # Expo React Native shell
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
- `/offline` - 모바일/PWA 오프라인 안내 fallback
- `/robots.txt` - 공개/비공개 route 크롤링 정책
- `/sitemap.xml` - 공개 페이지와 visible 마켓 상세 sitemap
- `/.well-known/security.txt` - 보안 연락 및 disclosure metadata

### 인증 필요 페이지
- `/app` - 내 활동 (실제 예측 통계, 랭킹, 최근 예측, DPMM ledger)
- `/app/recommendations` - 활동/시장 신호 기반 AI 예측 추천
- `/app/trends` - 최근 참여/댓글/신규 마켓 기반 트렌드 예측
- `/app/achievements` - 업적 현황 및 다음 목표
- `/app/level` - XP, 레벨, 레벨업 보상 수령
- `/app/seasons` - 월간/분기 시즌 챔피언십 leaderboard
- `/app/shop` - 프로필 테마, 배지, 이모티콘 아이템샵
- `/app/security` - 패스키 등록/삭제 및 계정 보안
- `/app/stats` - 사용자 통계 대시보드 (승률, 수익률, 예측/카테고리 분포)
- `/app/wallet` - Solana DPMM 지갑 연결, on-chain 잔액 조회, 출금 상태 추적
- `/feed` - 팔로우한 회원들의 공개 예측/댓글 활동 피드
- `/markets` - 예측 시장 목록
- `/markets/[id]` - 예측 상세 및 마켓 토론
- `/notifications` - 새 팔로워와 내가 만든 마켓 댓글 알림함
- `/users/[id]` - 사용자 프로필
- `/leaderboard` - 순위표

### 관리자 페이지
- `/admin` - 운영 대시보드 (마켓, 출금 큐, DPMM ledger 지표)
- `/admin/markets` - 마켓 관리
- `/admin/stats/markets` - 마켓 통계 (예측 정확도, 참여자 분석)
- `/admin/stats/trends` - 트렌드 분석 (인기 카테고리, 급상승 마켓)
- `/admin/stats/anomalies` - 이상 거래 탐지 (예측, 장부, 출금, 포지션 신호)
- `/admin/markets/create` - 마켓 생성
- `/admin/users` - 회원 관리
- `/admin/users/[id]` - 회원 상세 및 DPMM ledger 조회
- `/admin/withdrawals` - DPMM 출금 요청 관리

### API
- `/api/b2b/analytics` - 비식별 aggregate 마켓/카테고리/트렌드 데이터 API

---

## ⚡ 핵심 기능

### 모바일 앱 기반
- Web App Manifest 기반 홈 화면 설치 지원
- Service Worker 기반 navigation offline fallback
- cookie-locale HTML은 캐시하지 않는 navigation network-only 처리
- manifest/icon 정적 asset cache와 Service Worker static offline fallback
- 오프라인 상태 배너
- Web Push 기반 브라우저 푸시 알림 구독/발송
- WebAuthn/passkey 기반 생체 인증 로그인
- Expo React Native shell 기반 iOS/Android 앱 초안
- 인증 페이지/API 응답은 precache하지 않는 보수적 캐시 정책

### 게임화
- 예측, 적중, 수익, 참여량, 커뮤니티 활동 기반 업적 시스템
- 첫 예측, 첫 적중, 3연승/10연승, 누적 수익/참여량 업적 자동 집계
- 사용자별 업적 진행률과 다음 목표 표시
- 활동 기반 XP와 10단계 레벨 시스템
- 레벨 달성 후 명시적 claim으로 DPMM 보상 지급
- 월간/분기 시즌 챔피언십과 Top 10 leaderboard
- 시즌별 예측, 적중, 참여량, 수익, 댓글 점수 자동 집계
- DPMM 기반 아이템샵에서 프로필 테마, 배지, 이모티콘 구매
- 구매 아이템 장착 후 공개 프로필 cosmetic 표시

### AI 추천
- 사용자 예측 이력, 카테고리 선호, 시장 momentum 기반 추천
- AMM 확률 기준 추천 선택지와 risk level 표시
- 이미 참여한 마켓 제외
- 추천 사유와 점수 breakdown 제공

### 트렌드 예측
- 최근 7일과 이전 7일의 공개 마켓 참여/댓글/신규 생성 신호 비교
- 카테고리별 수요 점수, 신뢰도, 성장률 표시
- 운영자가 참고할 수 있는 신규 마켓 주제 후보 제공
- 외부 AI API 없이 로컬 trend scoring model로 계산

### React Native 앱

`mobile/`은 production origin인 `https://dopameme.kr`만 허용하는 Expo WebView shell입니다.

```bash
cd mobile
npm install
npm run ios
npm run android
```

native shell은 back/reload/open-in-browser/share toolbar와 network retry state를 제공합니다. WebView에서 passkey 동작이 제한되는 기기에서는 system browser fallback을 사용합니다.

### 예측 시스템
- 다양한 카테고리의 예측 마켓
- 한국/미국/일본/유럽/글로벌 지역 메타데이터와 해외 이슈 필터
- 마켓별 타임존 기반 마감 입력과 현지 시각 표시
- 마켓당 2-6개 선택지 지원
- 실시간 확률 업데이트
- virtual liquidity AMM 가격/확률 레이어
- 마켓 상세 가격 차트
- DPMM 포인트로 예측 참여
- 활성 마켓 포지션 부분 청산
- 활성 마켓 포지션 2차 거래
- 1% 플랫폼 수수료
- 예측 참여, 정산, 출금, 관리자 조정을 DPMM ledger로 추적
- 마켓별 댓글로 참여자 토론 지원

### 사용자 시스템
- 이메일/비밀번호 또는 Google OAuth 로그인
- 신규 가입 시 10,000 DPMM 웰컴 보너스
- 자동 닉네임 생성
- 사용자 프로필
- 사용자 통계 대시보드
- 팔로우/팔로워 관계
- 한국어/영어/일본어 언어 전환과 공개 랜딩 페이지 현지화
- locale cookie 기반 root `<html lang>` 동기화
- 공개/auth entry title, description, OpenGraph/Twitter metadata 현지화
- 공개 마켓 탐색과 로그인/회원가입 진입 화면의 locale별 문구
- 카테고리/지역 label, 현지 콘텐츠 우선 정렬
- 해외 이슈 마켓 탐색
- 마켓별 현지 마감 시각 확인
- 새 팔로워 및 내 마켓 댓글 in-app 알림
- 순위표
- Solana devnet DPMM 지갑 연결 및 on-chain 잔액 조회
- 장부 DPMM 출금 요청

### 관리자 기능
- 예측 마켓 생성
- 결과 확정 및 보상 분배
- 마켓 가리기/삭제
- 마켓 예측 정확도 및 참여자 분석
- 인기 카테고리 및 급상승 마켓 분석
- 예측 급증, DPMM 장부 변동, 출금 압력, 포지션 거래 회전 이상 탐지
- 비식별 B2B aggregate 데이터 API
- 회원 권한/상태 관리
- 회원 DPMM 잔액 조정 및 상세 ledger 이력 조회
- 출금 처리 큐와 DPMM ledger 운영 지표 모니터링
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
B2B_API_KEYS=
WEB_PUSH_VAPID_PUBLIC_KEY=
WEB_PUSH_VAPID_PRIVATE_KEY=
WEB_PUSH_CONTACT=https://dopameme.kr
WEBAUTHN_ORIGIN=https://dopameme.kr
WEBAUTHN_RP_ID=dopameme.kr
```

`DATABASE_URL`에 특수문자가 포함된 비밀번호를 넣는 경우 URL percent-encoding을 적용하세요.

Docker/Vultr 배포 절차는 [배포 문서](./docs/DEPLOYMENT.md)를 참고하세요.

---

## 📈 개발 로드맵

- ✅ **Phase 1**: MVP 출시 (완료)
- ✅ **Phase 2**: 커뮤니티 기능 (Q1 2025)
- ✅ **Phase 3**: 고급 기능 (Q2 2025)
- ✅ **Phase 4**: 데이터 분석 (Q3 2025)
- ✅ **Phase 5**: 모바일 앱 기반 (Q4 2025)
- ✅ **Phase 6**: 게임화 강화 (2026)
- ✅ **Phase 7**: AI & 머신러닝 (2026)
- ✅ **Phase 8**: 글로벌 확장 (2027)

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
