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
