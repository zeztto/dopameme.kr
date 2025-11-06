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
  INSERT INTO users (id, name, email, password, role, dpmm_balance, created_at)
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

  -- 2. 모든 테스트 계정의 DPMM 잔고를 100만으로 설정
  UPDATE users
  SET dpmm_balance = 1000000
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
