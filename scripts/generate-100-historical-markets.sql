-- 2025년 10월 31일까지 결과가 확정되는 100개의 과거 이벤트 예측 시장 생성
-- 이미 생성된 예측과 중복되지 않는 새로운 예측들

DO $$
DECLARE
  v_admin_id TEXT;
  v_market_id TEXT;
  v_market_count INTEGER := 0;
BEGIN
  -- Admin 사용자 ID 가져오기
  SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin 사용자를 찾을 수 없습니다';
  END IF;

  RAISE NOTICE '과거 이벤트 예측 시장 100개 생성 시작...';

  -- ========== 정치 카테고리 (15개) ==========

  -- 정치 1: 2024년 총선 투표율
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 4월 10일 총선 투표율이 60% 이상일까?',
    '2024년 4월 10일 제22대 국회의원 선거의 전국 투표율이 60% 이상이면 "예"로 확정. 중앙선거관리위원회 공식 발표 기준.',
    '정치',
    'active',
    v_admin_id,
    '2024-04-11 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- 정치 2: 2024년 총선 여당 의석
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 총선에서 국민의힘이 150석 이상을 차지할까?',
    '2024년 4월 10일 총선에서 국민의힘의 최종 의석수가 150석 이상이면 "예"로 확정. 중앙선관위 공식 발표 기준.',
    '정치',
    'active',
    v_admin_id,
    '2024-04-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- 정치 3: 2024년 총선 야당 의석
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 총선에서 더불어민주당이 180석 이상을 차지할까?',
    '2024년 4월 10일 총선에서 더불어민주당의 최종 의석수가 180석 이상이면 "예"로 확정. 중앙선관위 공식 발표 기준.',
    '정치',
    'active',
    v_admin_id,
    '2024-04-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- 정치 4: 2024년 미국 대선
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 11월 미국 대선에서 공화당 후보가 승리할까?',
    '2024년 11월 5일 미국 대통령 선거에서 공화당 후보가 당선되면 "예"로 확정. 미국 선거인단 투표 결과 기준.',
    '정치',
    'active',
    v_admin_id,
    '2024-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- 정치 5: 2024년 상반기 지지율
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 6월 대통령 국정지지율이 40% 이상일까?',
    '2024년 6월 마지막 주 갤럽 여론조사 대통령 직무수행 긍정평가가 40% 이상이면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2024-07-05 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- 정치 6-15: 추가 정치 예측
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 하반기 내각 개편이 있을까?',
    '2024년 7월 1일부터 12월 31일까지 국무총리 또는 3명 이상의 장관이 교체되면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2025-01-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 1분기 야당 대표 지지율이 30% 이상일까?',
    '2025년 3월 마지막 주 갤럽 여론조사에서 더불어민주당 대표 호감도가 30% 이상이면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2025-04-05 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 국회에서 중대한 법안 충돌이 5건 이상 있을까?',
    '2024년 1월 1일부터 12월 31일까지 국회 본회의에서 여야 합의 없이 단독 처리된 주요 법안이 5건 이상이면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 지방자치단체장 중 사퇴자가 3명 이상 발생할까?',
    '2024년 1월 1일부터 12월 31일까지 광역 또는 기초단체장 중 사퇴자가 3명 이상이면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2025-01-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 여당 지지율이 40% 이상을 기록한 적이 있을까?',
    '2025년 1월부터 6월까지 갤럽 주간조사에서 국민의힘 지지율이 40% 이상을 1회 이상 기록하면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2025-07-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 대법원 주요 정치 관련 판결이 3건 이상 있을까?',
    '2024년 1월부터 12월까지 대법원에서 정치인 또는 정치 관련 사건의 최종 판결이 3건 이상 선고되면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 1분기 국회 본회의 개최 횟수가 20회 이상일까?',
    '2025년 1월 1일부터 3월 31일까지 국회 본회의가 20회 이상 개최되면 "예"로 확정. 국회 공식 기록 기준.',
    '정치',
    'active',
    v_admin_id,
    '2025-04-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 청와대 관련 새로운 정책 발표가 10건 이상 있을까?',
    '2024년 1월부터 12월까지 대통령실에서 발표한 주요 신규 정책이 10건 이상이면 "예"로 확정. 대통령실 공식 보도자료 기준.',
    '정치',
    'active',
    v_admin_id,
    '2025-01-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 국무회의가 20회 이상 개최될까?',
    '2025년 1월 1일부터 6월 30일까지 국무회의가 20회 이상 개최되면 "예"로 확정. 정부 공식 발표 기준.',
    '정치',
    'active',
    v_admin_id,
    '2025-07-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 국회의원 윤리특위 징계 사례가 5건 이상 있을까?',
    '2024년 1월부터 12월까지 국회 윤리특별위원회에서 의원 징계 의결이 5건 이상 발생하면 "예"로 확정.',
    '정치',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- ========== 경제 카테고리 (15개) ==========

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 12월 31일 코스피 지수가 2,500 이상일까?',
    '2024년 12월 31일 한국거래소 코스피 종가가 2,500 이상이면 "예"로 확정.',
    '경제',
    'active',
    v_admin_id,
    '2025-01-03 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 연말 삼성전자 주가가 80,000원 이상일까?',
    '2024년 12월 30일 한국거래소 삼성전자 종가가 80,000원 이상이면 "예"로 확정.',
    '경제',
    'active',
    v_admin_id,
    '2025-01-03 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 비트코인이 10만 달러를 돌파한 적이 있을까?',
    '2024년 1월 1일부터 12월 31일까지 비트코인(BTC/USD)이 단 한 번이라도 $100,000를 돌파하면 "예"로 확정. CoinMarketCap 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-01-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 환율이 1,400원을 돌파한 적이 있을까?',
    '2024년 1월 1일부터 12월 31일까지 USD/KRW 환율이 단 한 번이라도 1,400원을 돌파하면 "예"로 확정. 서울외국환중개 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-01-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 한국은행 기준금리가 3% 미만으로 내려갔을까?',
    '2024년 1월부터 12월까지 한국은행 기준금리가 단 한 번이라도 3% 미만으로 인하되면 "예"로 확정.',
    '경제',
    'active',
    v_admin_id,
    '2025-01-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 1분기 GDP 성장률이 1% 이상일까?',
    '2025년 1분기 실질 GDP 성장률(전기 대비)이 1% 이상이면 "예"로 확정. 한국은행 공식 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-06-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 소비자물가 상승률이 연평균 3% 이상일까?',
    '2024년 연평균 소비자물가 상승률이 3% 이상이면 "예"로 확정. 통계청 공식 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 실업률이 4% 이상을 기록한 달이 있을까?',
    '2024년 1월부터 12월까지 월별 실업률이 단 한 번이라도 4% 이상을 기록하면 "예"로 확정. 통계청 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 가계부채가 1,900조원을 넘을까?',
    '2024년 12월 기준 가계신용(가계대출+판매신용) 잔액이 1,900조원 이상이면 "예"로 확정. 한국은행 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-03-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 반도체 수출액이 1,000억 달러를 넘을까?',
    '2024년 1월부터 12월까지 반도체 수출액 합계가 1,000억 달러 이상이면 "예"로 확정. 관세청 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 6월 서울 아파트 중위가격이 10억원을 넘을까?',
    '2025년 6월 기준 서울 아파트 매매 중위가격이 10억원 이상이면 "예"로 확정. 한국부동산원 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-07-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 전기차 등록대수가 50만대를 돌파할까?',
    '2024년 12월 31일 기준 국내 전기차 누적 등록대수가 50만대 이상이면 "예"로 확정. 국토교통부 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 국제 유가(WTI)가 100달러를 넘은 적이 있을까?',
    '2025년 1월부터 6월까지 WTI 원유 선물 가격이 단 한 번이라도 배럴당 100달러를 넘으면 "예"로 확정.',
    '경제',
    'active',
    v_admin_id,
    '2025-07-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 한국 무역수지가 연간 흑자를 기록할까?',
    '2024년 1월부터 12월까지 수출액에서 수입액을 뺀 무역수지가 플러스(흑자)면 "예"로 확정. 관세청 발표 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 네이버 주가가 30만원을 넘은 적이 있을까?',
    '2025년 1월부터 6월까지 네이버 주가가 단 한 번이라도 30만원을 넘으면 "예"로 확정. 한국거래소 기준.',
    '경제',
    'active',
    v_admin_id,
    '2025-07-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- ========== 스포츠 카테고리 (15개) ==========

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 KBO 정규시즌 우승팀은 기아 타이거즈였을까?',
    '2024 KBO 정규시즌 1위 팀이 기아 타이거즈면 "예"로 확정. KBO 공식 순위 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2024-10-05 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 KBO 한국시리즈 우승팀은?',
    '2024 KBO 한국시리즈 우승팀을 맞추는 예측. KBO 공식 발표 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2024-11-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '기아', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '삼성', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, 'LG', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '손흥민이 2024-25 EPL 시즌에 15골 이상을 넣었을까?',
    '2024-25 프리미어리그 시즌에서 손흥민의 리그 득점이 15골 이상이면 "예"로 확정. EPL 공식 기록 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-05-25 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 EPL 우승팀은 맨체스터 시티였을까?',
    '2024-25 프리미어리그 우승팀이 맨체스터 시티면 "예"로 확정. EPL 공식 순위 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-05-25 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 UEFA 챔피언스리그 우승팀은?',
    '2024-25 UEFA 챔피언스리그 우승팀을 맞추는 예측. UEFA 공식 발표 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-06-01 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '레알 마드리드', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '맨체스터 시티', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '바이에른 뮌헨', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '이강인이 2024-25 시즌에 10도움 이상을 기록할까?',
    '2024-25 시즌(리그+컵대회) 이강인의 총 도움이 10개 이상이면 "예"로 확정. 공식 기록 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-06-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 NBA 챔피언은 보스턴 셀틱스였을까?',
    '2024-25 NBA 파이널 우승팀이 보스턴 셀틱스면 "예"로 확정. NBA 공식 발표 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-06-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 라리가 우승팀은 레알 마드리드였을까?',
    '2024-25 라리가 우승팀이 레알 마드리드면 "예"로 확정. 라리가 공식 순위 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-06-01 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 분데스리가 득점왕은 해리 케인일까?',
    '2024-25 분데스리가 득점왕이 해리 케인이면 "예"로 확정. 분데스리가 공식 기록 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-05-25 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 파리 올림픽에서 한국이 금메달 10개 이상을 획득할까?',
    '2024 파리 올림픽에서 대한민국 선수단이 획득한 금메달이 10개 이상이면 "예"로 확정. IOC 공식 기록 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2024-08-12 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 파리 올림픽 한국 종합 순위는 10위 이내였을까?',
    '2024 파리 올림픽 최종 메달 순위에서 한국이 10위 이내면 "예"로 확정. IOC 공식 순위 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2024-08-12 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '류현진이 2024 시즌에 10승 이상을 기록할까?',
    '2024 MLB 시즌에서 류현진의 승수가 10승 이상이면 "예"로 확정. MLB 공식 기록 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2024-10-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025 호주 오픈 남자 단식 우승자는 노박 조코비치였을까?',
    '2025 호주 오픈 테니스 남자 단식 우승자가 노박 조코비치면 "예"로 확정. ATP 공식 발표 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-02-01 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 V리그 남자부 우승팀은 현대캐피탈일까?',
    '2024-25 V리그 남자부 챔피언 결정전 우승팀이 현대캐피탈이면 "예"로 확정. KOVO 공식 발표 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-04-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024-25 K리그1 우승팀은 울산 현대였을까?',
    '2024-25 K리그1 정규시즌 1위 팀이 울산 현대면 "예"로 확정. K리그 공식 순위 기준.',
    '스포츠',
    'active',
    v_admin_id,
    '2025-10-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- ========== 연예 카테고리 (15개) ==========

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 한국 영화 중 1000만 관객을 돌파한 작품이 있을까?',
    '2024년 1월부터 12월까지 개봉한 한국 영화 중 누적 관객 1000만명을 돌파한 작품이 1편 이상 있으면 "예"로 확정. 영화진흥위원회 공식 집계 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '제97회 아카데미 시상식 작품상은 "오펜하이머"였을까?',
    '제97회 아카데미 시상식(2025년 개최)에서 작품상 수상작이 "오펜하이머"면 "예"로 확정. 아카데미 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-03-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    'BTS가 2024년에 완전체 컴백을 할까?',
    '2024년 1월부터 12월까지 BTS 7명 전원이 참여한 정규/미니 앨범 발매 또는 단독 콘서트 개최가 있으면 "예"로 확정.',
    '연예',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 멜론 연간차트 1위 곡의 아티스트는?',
    '2024 멜론 연간 차트 1위 곡의 아티스트를 맞추는 예측. 멜론 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-01-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '아이브', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '뉴진스', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, 'IU', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 넷플릭스 한국 콘텐츠가 글로벌 Top 10에 5주 이상 진입한 작품이 있을까?',
    '2024년 한국 드라마/영화 중 넷플릭스 글로벌 Top 10에 5주 이상 연속/누적 진입한 작품이 1개 이상 있으면 "예"로 확정. 넷플릭스 공식 순위 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 백상예술대상 TV부문 대상은 "눈물의 여왕"일까?',
    '제60회 백상예술대상(2024년 개최) TV부문 대상 수상작이 "눈물의 여왕"이면 "예"로 확정. 백상예술대상 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2024-05-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 K-POP 그룹이 빌보드 200 1위를 차지한 적이 있을까?',
    '2024년 1월부터 12월까지 한국 아이돌 그룹의 앨범이 빌보드 200 차트 1위를 1회 이상 기록하면 "예"로 확정. 빌보드 공식 차트 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-01-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 MAMA 올해의 아티스트는 세븐틴일까?',
    '2024 MAMA AWARDS(2024년 11-12월 개최) 올해의 아티스트 수상자가 세븐틴이면 "예"로 확정. MAMA 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2024-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024 대종상 영화제 작품상은?',
    '제60회 대종상 영화제(2024년 개최) 작품상 수상작을 맞추는 예측. 대종상 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2024-11-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '파묘', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '범죄도시4', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '서울의 봄', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '기타', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 유튜브 구독자 1000만을 돌파한 한국 개인 크리에이터가 나올까?',
    '2025년 1월부터 6월까지 한국인 개인 유튜버 중 구독자 1000만을 새로 돌파한 채널이 1개 이상 있으면 "예"로 확정.',
    '연예',
    'active',
    v_admin_id,
    '2025-07-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 트와이스가 정규 앨범을 발매할까?',
    '2024년 1월부터 12월까지 트와이스가 정규 앨범(Full Album)을 발매하면 "예"로 확정. 미니앨범은 제외.',
    '연예',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 한국 드라마가 에미상을 수상할까?',
    '2024년 프라임타임 에미상 또는 크리에이티브 아츠 에미상에서 한국 드라마가 1개 이상 부문 수상하면 "예"로 확정. 에미상 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2024-09-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 칸 영화제에서 한국 영화가 황금종려상을 수상할까?',
    '2025년 칸 영화제(5월 개최)에서 한국 영화가 황금종려상을 수상하면 "예"로 확정. 칸 영화제 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-05-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 MBC 연기대상 대상은 김수현일까?',
    '2024 MBC 연기대상(2024년 12월 개최) 대상 수상자가 김수현이면 "예"로 확정. MBC 공식 발표 기준.',
    '연예',
    'active',
    v_admin_id,
    '2025-01-05 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 아이유가 새 정규앨범을 발매할까?',
    '2025년 1월부터 6월까지 아이유가 정규 앨범(Full Album)을 발매하면 "예"로 확정. 미니앨범/싱글은 제외.',
    '연예',
    'active',
    v_admin_id,
    '2025-07-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  RAISE NOTICE '50개 시장 생성 완료 (현재까지 % 개)', v_market_count;

  -- ========== 기술 카테고리 (10개) ==========

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    'ChatGPT 유료 구독자가 2024년에 5000만명을 돌파할까?',
    '2024년 12월 31일 기준 ChatGPT Plus/Pro/Team/Enterprise 합산 유료 구독자가 5000만명 이상이면 "예"로 확정. OpenAI 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    'OpenAI가 2024년에 GPT-4.5 또는 GPT-5를 출시할까?',
    '2024년 1월부터 12월까지 OpenAI가 GPT-4.5 또는 GPT-5 모델을 공식 출시하면 "예"로 확정. OpenAI 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '애플이 2024년에 AI 기능을 탑재한 새 아이폰을 출시할까?',
    '2024년 애플이 출시한 아이폰 신제품에 온디바이스 AI 기능(Siri 고도화 등)이 탑재되면 "예"로 확정. 애플 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2024-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '삼성전자가 2024년에 갤럭시 링을 출시할까?',
    '2024년 삼성전자가 갤럭시 링(Galaxy Ring) 제품을 공식 출시하면 "예"로 확정. 삼성전자 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '테슬라 FSD(완전자율주행)가 2024년에 미국에서 레벨4 인증을 받았을까?',
    '2024년 테슬라 FSD가 미국 내에서 SAE 레벨4 자율주행 인증을 획득하면 "예"로 확정. 미국 교통당국 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '메타가 2024년에 Llama 3를 출시할까?',
    '2024년 메타(Meta)가 Llama 3 언어모델을 공식 출시하면 "예"로 확정. Meta 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '구글이 2024년에 Gemini Ultra를 대중에게 공개할까?',
    '2024년 구글이 Gemini Ultra 모델을 유료 또는 무료로 일반 사용자에게 공개하면 "예"로 확정. 구글 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '엔비디아 주가가 2024년에 $1,000를 돌파한 적이 있을까?',
    '2024년 1월부터 12월까지 엔비디아(NVDA) 주가가 단 한 번이라도 주당 $1,000를 돌파하면 "예"로 확정. NASDAQ 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '스페이스X가 2024년에 스타십 궤도 비행에 성공할까?',
    '2024년 스페이스X 스타십이 지구 궤도 진입 및 복귀에 성공하면 "예"로 확정. SpaceX 공식 발표 기준.',
    '기술',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 양자컴퓨터가 새로운 암호화 알고리즘을 깬 사례가 발표될까?',
    '2024년 양자컴퓨터가 실용 수준의 암호화(RSA 등)를 해독했다는 peer-reviewed 논문이 발표되면 "예"로 확정.',
    '기술',
    'active',
    v_admin_id,
    '2025-03-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- ========== 날씨 카테고리 (10개) ==========

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 크리스마스(12월 24-25일)에 서울에 눈이 내렸을까?',
    '2024년 12월 24일 0시부터 25일 23시 59분까지 서울(기상청 서울 관측소)에 눈(적설량 0.1cm 이상)이 관측되면 "예"로 확정.',
    '날씨',
    'active',
    v_admin_id,
    '2024-12-26 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 서울 첫눈은 11월에 올까?',
    '2024년 11월 1일부터 11월 30일까지 서울(기상청 서울 관측소)에서 첫눈이 관측되면 "예"로 확정. 기상청 공식 발표 기준.',
    '날씨',
    'active',
    v_admin_id,
    '2024-12-10 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 여름(6-8월) 서울 폭염일수가 20일 이상일까?',
    '2024년 6월 1일부터 8월 31일까지 서울 일 최고기온 33도 이상 기록일이 20일 이상이면 "예"로 확정. 기상청 기준.',
    '날씨',
    'active',
    v_admin_id,
    '2024-09-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 중부지방 장마는 6월에 시작할까?',
    '기상청이 공식 발표한 2024년 중부지방 장마 시작일이 6월 1일부터 6월 30일 사이면 "예"로 확정.',
    '날씨',
    'active',
    v_admin_id,
    '2024-07-15 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 한반도에 영향을 준 태풍은 3개 이상일까?',
    '2024년 1월부터 12월까지 기상청이 "한반도에 영향을 준 태풍"으로 공식 발표한 개수가 3개 이상이면 "예"로 확정.',
    '날씨',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 서울 연평균 기온이 13도 이상일까?',
    '기상청이 발표하는 2024년 서울 연평균 기온이 13도 이상이면 "예"로 확정. 기상청 공식 발표 기준.',
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
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 1분기(1-3월) 서울 초미세먼지 "매우 나쁨" 일수가 10일 이상일까?',
    '2025년 1월 1일부터 3월 31일까지 서울 초미세먼지 일평균 "매우 나쁨"(76㎍/㎥ 이상) 일수가 10일 이상이면 "예"로 확정. 에어코리아 기준.',
    '날씨',
    'active',
    v_admin_id,
    '2025-04-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 봄(3-5월) 서울에 황사 특보가 발령될까?',
    '2025년 3월 1일부터 5월 31일까지 기상청이 서울에 황사주의보 또는 황사경보를 발령하면 "예"로 확정.',
    '날씨',
    'active',
    v_admin_id,
    '2025-06-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 서울 벚꽃 개화일은 3월일까?',
    '기상청이 공식 발표하는 2025년 서울 여의도 벚꽃 개화일이 3월 1일부터 3월 31일 사이면 "예"로 확정.',
    '날씨',
    'active',
    v_admin_id,
    '2025-04-30 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 가을(9-11월) 서울에 태풍 특보가 발령된 적이 있을까?',
    '2024년 9월 1일부터 11월 30일까지 기상청이 서울에 태풍주의보 또는 태풍경보를 발령하면 "예"로 확정.',
    '날씨',
    'active',
    v_admin_id,
    '2024-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  RAISE NOTICE '70개 시장 생성 완료 (현재까지 % 개)', v_market_count;

  -- ========== 이슈 카테고리 (10개) ==========

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 병역법 개정안이 국회를 통과할까?',
    '2024년 1월부터 12월까지 병역법 개정안이 국회 본회의를 통과하면 "예"로 확정. 국회 공식 기록 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 국민 1인당 25만원 지원금이 지급될까?',
    '2024년 정부가 전국민 대상 1인당 25만원 현금/지역화폐 지원금을 실제 지급하면 "예"로 확정. 정부 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 주 52시간 근무제 예외 업종이 확대될까?',
    '2024년 근로기준법 개정으로 주 52시간 근무제 예외 업종이 추가되면 "예"로 확정. 고용노동부 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 합계출산율이 0.7 이상일까?',
    '2024년 한국의 합계출산율이 0.7 이상이면 "예"로 확정. 통계청 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-03-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 의대 정원 증원이 확정될까?',
    '2024년 정부가 2025학년도 이후 의대 정원 증원을 공식 확정 발표하면 "예"로 확정. 교육부 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 최저임금이 시간당 10,000원 이상일까?',
    '2025년 적용 최저임금이 시간당 10,000원 이상이면 "예"로 확정. 최저임금위원회 공식 고시 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2024-08-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 교통사고 사망자 수가 3,000명 미만일까?',
    '2024년 1월 1일부터 12월 31일까지 교통사고 사망자 수가 3,000명 미만이면 "예"로 확정. 경찰청 공식 통계 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 수능 응시자가 50만명 이상일까?',
    '2025학년도 대학수학능력시험 응시자가 50만명 이상이면 "예"로 확정. 한국교육과정평가원 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2024-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 서울 아파트 거래량이 전년 대비 증가할까?',
    '2024년 서울 아파트 매매 거래량이 2023년 대비 증가하면 "예"로 확정. 국토교통부 실거래가 공개시스템 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-02-28 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 국내 신생아 수가 월평균 2만명 이상일까?',
    '2025년 1월부터 6월까지 월평균 출생아 수가 2만명 이상이면 "예"로 확정. 통계청 공식 발표 기준.',
    '이슈',
    'active',
    v_admin_id,
    '2025-08-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  -- ========== 국제 카테고리 (10개) ==========

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 11월 미국 대선에서 도널드 트럼프가 당선될까?',
    '2024년 11월 5일 미국 대통령 선거에서 도널드 트럼프가 당선되면 "예"로 확정. 미국 선거인단 투표 결과 기준.',
    '국제',
    'active',
    v_admin_id,
    '2024-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 북한이 ICBM 발사를 할까?',
    '2024년 1월부터 12월까지 북한이 대륙간탄도미사일(ICBM)을 발사하면 "예"로 확정. 한국 국방부 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 한일 정상회담이 개최될까?',
    '2024년 1월부터 12월까지 한국과 일본 정상이 공식 정상회담을 개최하면 "예"로 확정. 양국 정부 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 우크라이나 전쟁 휴전 협정이 체결될까?',
    '2024년 1월부터 12월까지 러시아와 우크라이나가 공식 휴전 협정에 서명하면 "예"로 확정. 양국 정부 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년에 중국과 대만 간 대규모 군사훈련이 있을까?',
    '2024년 중국이 대만 주변에서 대규모(1만명 이상) 군사훈련을 실시하면 "예"로 확정. 중국 국방부 또는 주요 언론 보도 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 G7 정상회의에 한국이 참석할까?',
    '2024년 G7 정상회의에 한국 대통령이 공식 참석하면 "예"로 확정. G7 공식 발표 또는 청와대 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2024-12-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 일본 총리가 교체될까?',
    '2024년 1월부터 12월까지 일본 총리가 교체되면 "예"로 확정. 일본 정부 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 부산 세계박람회 유치가 확정될까?',
    '2023년 11월 BIE 총회에서 2030 부산 세계박람회 개최지로 선정되었다면 "예"로 확정. BIE 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2024-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2024년 한미 정상회담이 2회 이상 개최될까?',
    '2024년 1월부터 12월까지 한국과 미국 정상 간 공식 정상회담이 2회 이상 개최되면 "예"로 확정. 양국 정부 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-01-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (
    v_market_id,
    '2025년 상반기 중국 GDP 성장률이 5% 이상일까?',
    '2025년 상반기(1-6월) 중국 GDP 성장률(전년 동기 대비)이 5% 이상이면 "예"로 확정. 중국 국가통계국 공식 발표 기준.',
    '국제',
    'active',
    v_admin_id,
    '2025-08-31 23:59:59'::timestamp,
    NOW()
  );
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES
    (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()),
    (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());
  v_market_count := v_market_count + 1;

  RAISE NOTICE '===============================================';
  RAISE NOTICE '과거 이벤트 예측 시장 100개 생성 완료!';
  RAISE NOTICE '총 % 개 시장이 생성되었습니다.', v_market_count;
  RAISE NOTICE '===============================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE;
END $$;
