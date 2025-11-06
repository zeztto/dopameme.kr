-- 최종 설정 SQL
-- 1. 수수료 소각 계정 생성
-- 2. 테스트 계정 잔고 100만 DPM 설정
-- 3. 기존 모호한 예측 삭제
-- 4. 명확한 기준의 새 예측 생성 (날씨, 이슈, 국제 포함)

-- Supabase SQL Editor에서 실행하세요

SELECT '테스트 환경 설정을 시작합니다...' as status;
-- 테스트 환경 설정 SQL
-- 1. 수수료 소각용 계정 생성
-- 2. 테스트 계정 잔고 업데이트
-- 3. 날씨 카테고리 예측 시장 생성

DO $$
DECLARE
  v_admin_id TEXT;
  v_market_id TEXT;
BEGIN
  -- 1. 수수료 소각용 계정 생성
  INSERT INTO users (id, name, email, password, role, dpm_balance, created_at)
  VALUES (
    'fee-burn-account',
    'FEE_BURN',
    'fee-burn@dopameme.kr',
    'DISABLED',
    'admin',
    0,
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '수수료 소각 계정 생성 완료';

  -- 2. 모든 테스트 계정의 DPM 잔고를 100만으로 설정
  UPDATE users
  SET dpm_balance = 1000000
  WHERE role = 'test';

  RAISE NOTICE '테스트 계정 잔고 업데이트 완료';

  -- 3. Admin 사용자 ID 가져오기
  SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin 사용자를 찾을 수 없습니다';
  END IF;

  -- 날씨 카테고리 예측 시장 생성

  -- 날씨 1: 크리스마스 서울 눈
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 12월 24일 0시부터 25일 자정까지 서울에 눈이 내릴까?',
    '크리스마스 기간(12월 24일 0시부터 25일 23시 59분까지) 중 서울 지역(기상청 서울 관측소 기준)에 눈(적설량 0.1cm 이상)이 관측되면 "예"로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2025-12-24 00:00:00'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- 날씨 2: 2월 서울 최고기온
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 2월 서울의 최고기온이 10도를 넘는 날이 있을까?',
    '2025년 2월 1일부터 2월 28일까지 기간 중 서울(기상청 서울 관측소)의 일 최고기온이 섭씨 10도 이상을 기록한 날이 하루라도 있으면 "예"로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- 날씨 3: 여름 폭염일수
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 여름(6-8월) 서울의 폭염일수는?',
    '2025년 6월 1일부터 8월 31일까지 서울(기상청 서울 관측소)에서 일 최고기온 33도 이상을 기록한 날의 총 일수를 기준으로 확정됩니다. 기상청 공식 발표 기준.',
    '날씨',
    'active',
    v_admin_id,
    '2025-08-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '20일 이상', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '10~19일', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '5~9일', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '5일 미만', 0, 0, NOW());

  -- 날씨 4: 장마 시작
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중부지방 장마는 6월에 시작할까?',
    '기상청이 공식 발표하는 2025년 중부지방(서울, 경기, 강원 영서 등) 장마 시작일이 6월 1일부터 6월 30일 사이면 "예", 7월 이후면 "아니오"로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2025-07-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- 날씨 5: 태풍 한반도 영향
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 여름(6-9월) 한반도에 영향을 준 태풍은 몇 개일까?',
    '2025년 6월 1일부터 9월 30일까지 기상청이 공식 발표한 "한반도에 영향을 준 태풍" 개수를 기준으로 확정됩니다. 직접 상륙 또는 간접 영향(호우, 강풍 등) 모두 포함.',
    '날씨',
    'active',
    v_admin_id,
    '2025-09-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '5개 이상', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '3~4개', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '1~2개', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '0개', 0, 0, NOW());

  -- 날씨 6: 첫눈
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025~2026년 겨울 서울 첫눈은 11월에 올까?',
    '2025년 11월 1일부터 11월 30일까지 서울(기상청 서울 관측소)에서 첫눈(날리는 눈 포함)이 관측되면 "예", 12월 이후면 "아니오"로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2025-12-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- 날씨 7: 벚꽃 개화
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 서울 여의도 벚꽃 개화일은?',
    '기상청이 공식 발표하는 서울 여의도 벚꽃 표준목의 개화일(꽃 3송이 이상 핀 날)을 기준으로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2025-04-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '3월 25일 이전', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '3월 26~31일', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '4월 1~5일', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '4월 6일 이후', 0, 0, NOW());

  -- 날씨 8: 초미세먼지
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 1분기(1-3월) 서울 초미세먼지 "매우 나쁨" 일수는?',
    '2025년 1월 1일부터 3월 31일까지 서울(에어코리아 서울 평균)의 초미세먼지(PM2.5) 일평균이 "매우 나쁨"(76㎍/㎥ 이상)을 기록한 날의 총 일수로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2025-03-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '20일 이상', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '10~19일', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '5~9일', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '5일 미만', 0, 0, NOW());

  -- 날씨 9: 황사
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 봄(3-5월) 서울에 황사가 관측될까?',
    '2025년 3월 1일부터 5월 31일까지 기상청이 서울에 황사 특보(황사주의보 또는 황사경보)를 발령하면 "예"로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2025-05-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- 날씨 10: 연평균 기온
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 서울 연평균 기온은 역대 최고를 경신할까?',
    '기상청이 공식 발표하는 2025년 서울의 연평균 기온이 역대(1907년 이후) 최고 기록을 경신하면 "예"로 확정됩니다.',
    '날씨',
    'active',
    v_admin_id,
    '2026-01-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  RAISE NOTICE '날씨 카테고리 예측 시장 10개 생성 완료';
  RAISE NOTICE '테스트 환경 설정 완료!';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE;
END $$;
-- 기존 모호한 예측 삭제 및 명확한 기준을 가진 새 예측 생성
-- 1. 기존 마켓 삭제
-- 2. 명확한 기준을 가진 새 마켓 생성 (이슈, 국제 카테고리 포함)

DO $$
DECLARE
  v_admin_id TEXT;
  v_market_id TEXT;
BEGIN
  -- Admin 사용자 ID 가져오기
  SELECT id INTO v_admin_id FROM users WHERE role = 'admin' AND id != 'fee-burn-account' LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin 사용자를 찾을 수 없습니다';
  END IF;

  -- 기존 active 상태의 마켓 모두 삭제 (resolved는 유지)
  DELETE FROM markets WHERE status = 'active';

  RAISE NOTICE '기존 active 마켓 삭제 완료';

  -- ============================================================
  -- 정치 카테고리 (명확한 기준)
  -- ============================================================

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 6월 4일 지방선거에서 여당이 광역단체장 과반을 차지할까?',
    '2025년 6월 4일 실시되는 전국동시지방선거에서 여당 소속 광역단체장 당선자가 17개 광역시·도 중 9곳 이상이면 "예"로 확정됩니다. 중앙선거관리위원회 공식 발표 기준.',
    '정치',
    'active',
    v_admin_id,
    '2025-06-04 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- ============================================================
  -- 경제 카테고리 (명확한 기준)
  -- ============================================================

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 12월 31일 종가 기준 비트코인 가격이 10만 달러 이상일까?',
    '2025년 12월 31일 23시 59분(UTC) 시점의 비트코인(BTC/USD) 가격이 $100,000 이상이면 "예"로 확정됩니다. CoinMarketCap 기준 가격 적용.',
    '경제',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 12월 30일 한국증시 종가 기준 삼성전자 주가가 10만원 이상일까?',
    '2025년 12월 30일 한국거래소 정규장 종가 기준 삼성전자(005930) 주가가 100,000원 이상이면 "예"로 확정됩니다.',
    '경제',
    'active',
    v_admin_id,
    '2025-12-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 12월 한국은행 기준금리 최종 결정 수준은?',
    '2025년 12월에 발표되는 한국은행 금융통화위원회의 기준금리 최종 결정치를 기준으로 확정됩니다. 한국은행 공식 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '3.0% 이상', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '2.5~2.99%', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '2.0~2.49%', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '2.0% 미만', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중 원/달러 환율이 1,400원을 돌파할까?',
    '2025년 1월 1일부터 12월 31일까지 서울외환시장 종가 기준 원/달러 환율이 1,400.00원 이상을 기록한 날이 하루라도 있으면 "예"로 확정됩니다.',
    '경제',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 4분기 통계청 발표 실업률은?',
    '통계청이 2026년 1월 발표하는 2025년 4분기 평균 실업률을 기준으로 확정됩니다. 통계청 공식 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2026-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '4.0% 이상', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '3.5~3.9%', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '3.0~3.4%', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '3.0% 미만', 0, 0, NOW());

  -- ============================================================
  -- 기술 카테고리 (명확한 기준)
  -- ============================================================

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '애플이 2025년 중 비전 프로를 한국에 정식 출시할까?',
    '2025년 12월 31일까지 애플이 공식 발표를 통해 Vision Pro의 한국 출시를 확정하고 예약 판매가 시작되면 "예"로 확정됩니다. 애플 코리아 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    'OpenAI가 2025년 중 GPT-5를 출시할까?',
    '2025년 12월 31일까지 OpenAI가 공식 발표를 통해 "GPT-5" 또는 차기 주요 버전 모델을 정식 출시하면 "예"로 확정됩니다. OpenAI 공식 블로그/발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '테슬라 FSD가 2025년 중 미국에서 레벨4 자율주행 인증을 받을까?',
    '2025년 12월 31일까지 테슬라의 Full Self-Driving이 미국 SAE 기준 레벨4 자율주행 인증을 받으면 "예"로 확정됩니다. NHTSA 또는 관련 인증기관 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- ============================================================
  -- 스포츠 카테고리 (명확한 기준)
  -- ============================================================

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025 KBO 리그 정규시즌 우승팀은?',
    '2025 KBO 리그 정규시즌 최종 순위 1위 팀을 기준으로 확정됩니다. KBO 공식 발표 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-10-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, 'KIA', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, 'LG', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '삼성', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타 팀', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 EPL 시즌 손흥민의 최종 득점은?',
    '2024-25 시즌 잉글리시 프리미어리그 최종 종료 시점 손흥민의 총 득점 수를 기준으로 확정됩니다. EPL 공식 통계 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-05-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '20골 이상', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '15~19골', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '10~14골', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '10골 미만', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 UEFA 챔피언스리그 우승팀은?',
    '2024-25 시즌 UEFA 챔피언스리그 결승전 우승팀을 기준으로 확정됩니다. UEFA 공식 발표 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-06-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '레알 마드리드', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '맨체스터 시티', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '바이에른 뮌헨', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타 팀', 0, 0, NOW());

  -- ============================================================
  -- 연예 카테고리 (명확한 기준)
  -- ============================================================

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '제97회 아카데미 시상식 작품상 수상작은?',
    '2025년 3월 개최 예정인 제97회 아카데미 시상식에서 작품상(Best Picture)을 수상한 영화를 기준으로 확정됩니다. 아카데미 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-03-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, 'Dune: Part Two', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, 'Wicked', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, 'Anora', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타 작품', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 한국 영화 중 천만 관객 돌파작이 나올까?',
    '2025년 1월 1일부터 12월 31일까지 개봉한 한국 영화 중 누적 관객 수 1,000만 명을 돌파한 영화가 1편 이상 나오면 "예"로 확정됩니다. 영화진흥위원회 공식 통계 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 멜론 연간 차트 1위 아티스트는?',
    '멜론이 2025년 12월 발표하는 2025년 연간 차트(TOP100 기준) 1위 아티스트를 기준으로 확정됩니다. 멜론 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, 'BTS', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, 'NewJeans', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, 'IVE', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타 아티스트', 0, 0, NOW());

  -- ============================================================
  -- 이슈 카테고리 (명확한 기준)
  -- ============================================================

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중 병역법 개정안(대체복무 확대)이 국회 본회의를 통과할까?',
    '2025년 12월 31일까지 병역법 개정안(대체복무 확대 관련)이 국회 본회의에서 가결되면 "예"로 확정됩니다. 국회 공식 의안정보시스템 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025 부산세계박람회 유치 최종 결과는?',
    '2025년 중 국제박람회기구(BIE)가 발표하는 2030 부산세계박람회 유치 투표 결과를 기준으로 확정됩니다. BIE 공식 발표 기준. (이미 부산이 탈락했다면 "탈락"으로 확정)',
    '이슈',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '유치 확정', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '탈락', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중 전국민 25만원 지급(민생회복지원금) 정책이 시행될까?',
    '2025년 12월 31일까지 정부가 전국민 대상 1인당 25만원 규모의 민생회복지원금 지급을 공식 결정하고 지급이 시작되면 "예"로 확정됩니다. 정부 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 대학수학능력시험 응시자는 몇 명일까?',
    '2025학년도 대학수학능력시험(2024년 11월 실시) 최종 응시자 수를 기준으로 확정됩니다. 한국교육과정평가원 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2024-11-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '50만명 이상', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '45~49만명', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '40~44만명', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '40만명 미만', 0, 0, NOW());

  -- ============================================================
  -- 국제 카테고리 (명확한 기준)
  -- ============================================================

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 미국 대선 최종 승자는?',
    '2024년 11월 실시되는 미국 대통령 선거에서 당선이 확정된 후보를 기준으로 확정됩니다. 연방선거관리위원회 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2024-11-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '도널드 트럼프', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '카멀라 해리스', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중 북한이 ICBM급 미사일을 발사할까?',
    '2025년 12월 31일까지 북한이 ICBM(대륙간탄도미사일)급 미사일을 발사하면 "예"로 확정됩니다. 대한민국 합동참모본부 또는 미국 국방부 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중 한일정상회담이 개최될까?',
    '2025년 12월 31일까지 한국과 일본 정상 간 공식 정상회담(양자회담)이 개최되면 "예"로 확정됩니다. 외교부 또는 총리실 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중 우크라이나 전쟁 정전협정이 체결될까?',
    '2025년 12월 31일까지 러시아와 우크라이나 간 공식 정전협정이 체결되면 "예"로 확정됩니다. 유엔 또는 양국 정부 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 중 중국의 대만 무력시위(군사훈련)가 발생할까?',
    '2025년 12월 31일까지 중국이 대만 주변에서 대규모 군사훈련 또는 무력시위를 실시하면 "예"로 확정됩니다. 대만 국방부 또는 주요 언론 보도 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  RAISE NOTICE '새로운 명확한 기준의 예측 시장 생성 완료!';
  RAISE NOTICE '총 카테고리: 정치, 경제, 기술, 스포츠, 연예, 날씨, 이슈, 국제';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE;
END $$;
