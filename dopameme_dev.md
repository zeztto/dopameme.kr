# **도파밈.kr (Dopameme) MVP 개발 계획서**

본 문서는 '도파밈.kr' MVP(Minimum Viable Product) 구축을 위한 기술 스택 선정, 아키텍처 설계, 그리고 단계별 개발 로드맵을 정의합니다.

## **1\. 프로젝트 개요**

* **프로젝트명:** 도파밈.kr (Dopameme) MVP 개발  
* **목표:** 6주 내 핵심 기능(포인트 기반 예측 게임)을 갖춘 MVP 런칭  
* **핵심 기획:** [dopameme\_plan.md (기본 기획서)](https://www.google.com/search?q=dopameme_plan.md) 참조

## **2\. 기술 스택 (Tech Stack)**

* **프론트엔드 & 애플리케이션:** **Next.js 14+**  
  * App Router 기반으로 / (랜딩)와 /app (서비스) 라우팅 분리  
  * React (UI), Tailwind CSS (스타일링)  
* **백엔드 & 데이터베이스:** **Supabase**  
  * PostgreSQL 데이터베이스 (테이블 관리)  
  * Auth (소셜 로그인 및 사용자 관리)  
  * Storage (필요시 프로필 이미지 등 저장)  
  * Realtime (MVP 이후 가격 변동 실시간 반영에 활용)  
* **호스팅 & 배포:** **Vercel**  
  * Next.js에 최적화된 호스팅  
  * Git (Github/Gitlab) 연동을 통한 자동 CI/CD 파이프라인 구축

## **3\. 아키텍처 및 라우팅 구조**

요청대로 www.dopameme.kr (루트)에는 랜딩 페이지를, /app 경로 하위에 실제 서비스를 배치합니다.

* **도메인:** www.dopameme.kr (Vercel에 연결)  
* **Next.js App Router 구조 (예시):**  
  /app  
  ├── (landing)                   // 루트 도메인 그룹  
  │   ├── page.tsx                // (www.dopameme.kr) 랜딩 페이지  
  │   └── layout.tsx  
  │  
  ├── (app)                       // 실제 서비스 그룹  
  │   ├── app                     // (/app) 경로  
  │   │   ├── layout.tsx            // (/app) 레이아웃 (네비게이션 바, 사이드바 등)  
  │   │   ├── page.tsx              // (/app) 메인 대시보드 (마켓 리스트)  
  │   │   ├── market  
  │   │   │   └── \[id\]  
  │   │   │       └── page.tsx      // (/app/market/\[id\]) 마켓 상세 페이지  
  │   │   └── mypage  
  │   │       └── page.tsx          // (/app/mypage) 마이페이지  
  │   └── login  
  │       └── page.tsx            // (/login) 로그인 페이지 (app 그룹 외부에 배치)  
  │  
  └── layout.tsx                  // 최상위 루트 레이아웃

* **인증 흐름:**  
  * 비로그인 사용자가 /app 내 페이지 접근 시, Next.js 미들웨어(middleware.ts)가 /login 페이지로 리다이렉트.  
  * Supabase Auth (소셜 로그인) 성공 시 /app 메인으로 이동.

## **4\. Supabase 데이터베이스 스키마 (초안)**

* **profiles (사용자 프로필)**  
  * id (uuid, references auth.users.id, PK)  
  * username (text, unique)  
  * avatar\_url (text)  
  * points (int8, default: 10000\) \- 사용자의 현재 보유 포인트 (초기 가입 웰컴 보상)  
* **markets (밈 마켓)**  
  * id (uuid, PK)  
  * title (text, not null) \- 마켓 주제  
  * description (text) \- 상세 설명  
  * category (text) \- 정치, 경제, 스포츠 등  
  * end\_date (timestamp) \- 마감 시간  
  * status (enum: 'OPEN', 'CLOSED', 'RESOLVED') \- 상태 (진행중, 종료, 결과확정)  
  * result (boolean, nullable) \- 결과 (Yes: true, No: false)  
* **shares (사용자 지분)**  
  * id (uuid, PK)  
  * user\_id (uuid, FK to profiles.id)  
  * market\_id (uuid, FK to markets.id)  
  * outcome (boolean) \- 예측 (Yes: true, No: false)  
  * quantity (int) \- 구매 수량  
  * purchase\_price (int) \- 구매 당시 1주당 가격  
* **point\_history (포인트 내역)**  
  * id (uuid, PK)  
  * user\_id (uuid, FK to profiles.id)  
  * amount (int) \- 변경 수량 (+/-)  
  * reason (text) \- 사유 (예: 'MARKET\_PURCHASE', 'LOGIN\_BONUS', 'MARKET\_PAYOUT')  
  * created\_at (timestamp)

**보안:** 모든 테이블에 대해 Supabase RLS(Row Level Security)를 철저히 설정합니다. (예: 사용자는 자신의 profiles만 수정할 수 있고, 자신의 shares만 볼 수 있음).

## **5\. 단계별 개발 로드맵 (MVP 6주 계획)**

### **1단계 (Week 1): 환경 설정 및 인증 연동**

* \[ \] Next.js 프로젝트 생성 및 Github 레포지토리 연동  
* \[ \] Vercel 프로젝트 생성 및 Github 연동 (CI/CD 확인)  
* \[ \] Supabase 프로젝트 생성  
* \[ \] Supabase DB 스키마 설계 및 테이블 생성 (위 4번 항목)  
* \[ \] Next.js \- Supabase 클라이언트 연동  
* \[ \] Supabase Auth 연동: /login 페이지 및 소셜 로그인(Google, Kakao) 구현  
* \[ \] (App) 라우트 그룹 및 미들웨어를 통한 인증 보호 설정

### **2단계 (Week 2-3): 핵심 기능 \- 마켓 리스트 및 상세**

* \[ \] /app (메인): markets 테이블에서 status='OPEN'인 마켓 리스트 조회 및 UI 구현  
* \[ \] /app/market/\[id\] (상세):  
  * 선택한 마켓의 상세 정보 (설명, 마감일 등) 표시  
  * 'Yes' / 'No' 지분 가격 표시 로직 (초기 MVP: 50:50 고정 또는 단순 계산)  
  * *참고: Polymarket/Kalshi의 복잡한 AMM(Automated Market Maker)은 MVP 이후 구현*  
* \[ \] 마켓 컴포넌트 디자인 (카드 형태 UI)

### **3단계 (Week 4): 핵심 기능 \- 예측 구매 로직**

* \[ \] 마켓 상세 페이지에서 'Yes'/'No' 수량 입력 및 구매 버튼 UI  
* \[ \] 구매 로직 구현 (Supabase Edge Function 또는 서버 액션):  
  1. 사용자 points 확인  
  2. 포인트 차감 (profiles 테이블 업데이트)  
  3. shares 테이블에 구매 내역 기록  
  4. point\_history 테이블에 로그 기록 (트랜잭션 처리 필요)  
* \[ \] Supabase RLS 설정 (포인트 무단 변경 방지)

### **4단계 (Week 5): 마이페이지 및 결과 판정**

* \[ \] /app/mypage (마이페이지):  
  * 현재 보유 포인트 (profiles.points) 표시  
  * 내 예측 내역 (shares 테이블 조회) 표시  
  * 포인트 획득/사용 내역 (point\_history 조회) 표시  
* \[ \] **\[운영자 기능\]** 마켓 결과 판정:  
  * (MVP 단순화) Supabase 대시보드에서 직접 markets 테이블의 status를 'RESOLVED'로 변경하고 result (true/false) 값 입력  
* \[ \] **\[백그라운드 로직\]** 포인트 정산:  
  * markets 테이블의 result가 업데이트될 때 트리거되는 Supabase DB Function (pgSQL) 또는 스케줄러(pg\_cron) 설정  
  * shares를 조회하여 예측에 성공한 사용자에게 profiles.points 정산 및 point\_history 기록

### **5단계 (Week 6): 랜딩 페이지 및 배포**

* \[ \] (landing) 그룹의 / (루트) 페이지: 서비스 소개, 가입 유도 버튼 등 정적 랜딩 페이지 디자인 및 구현  
* \[ \] 최종 테스트: 회원가입 \> 마켓 참여 \> 결과 판정 \> 정산의 전체 플로우 테스트  
* \[ \] Vercel 프로덕션 배포 및 www.dopameme.kr 도메인 연결

## **6\. MVP 이후 고려 사항 (Phase 2\)**

* 복잡한 가격 책정 로직 (AMM) 도입  
* Supabase Realtime을 이용한 실시간 가격 변동 및 차트 제공  
* 마켓별 토론장 (커뮤니티) 기능  
* 랭킹/리더보드  
* 운영자용 어드민 대시보드 (마켓 생성, 결과 판정)