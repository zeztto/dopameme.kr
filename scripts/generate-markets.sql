-- 50개의 예측 시장 생성 SQL
-- Supabase SQL Editor에서 실행하세요
-- 먼저 admin 사용자의 ID를 확인해야 합니다

-- Admin ID를 변수로 설정 (실행 전에 실제 admin ID로 교체 필요)
DO $$
DECLARE
  v_admin_id TEXT;
  v_market_id TEXT;
  v_option1_id TEXT;
  v_option2_id TEXT;
  v_option3_id TEXT;
  v_option4_id TEXT;
BEGIN
  -- Admin 사용자 ID 가져오기
  SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin 사용자를 찾을 수 없습니다';
  END IF;

  -- 정치 카테고리 (10개)
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025년 국회의원 재보궐선거, 여당이 과반 획득할까?', '2025년 상반기 예정된 국회의원 재보궐선거에서 여당이 과반 이상의 의석을 차지할 것인지 예측하는 시장입니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '45 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '미국 대선, 트럼프가 재선에 성공할까?', '2024년 미국 대선에서 도널드 트럼프가 재선에 성공할지 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '120 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '트럼프 승리', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '민주당 승리', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '다음 총선에서 제3당이 캐스팅보트를 쥘까?', '차기 총선에서 제3당이 의회에서 결정적 역할을 할지 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '180 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025년 내 개헌 논의가 본격화될까?', '올해 안에 개헌 논의가 국회에서 본격적으로 시작될지 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '90 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '북미 정상회담이 올해 열릴까?', '2025년 내에 북한과 미국 간 정상회담이 개최될지 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '150 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '다음 서울시장은?', '차기 서울시장 선거 결과를 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '200 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '여당 후보', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '야당 후보', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '무소속 후보', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025년 지방선거, 수도권에서 야당이 우세할까?', '올해 지방선거에서 수도권 지역의 승자를 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '100 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '일본 총선, 자민당이 과반 유지할까?', '차기 일본 중의원 선거에서 자민당의 과반 유지 여부를 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '80 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '과반 유지', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '과반 상실', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '영국 총선, 노동당이 집권할까?', '차기 영국 총선에서 노동당의 집권 가능성을 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '60 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '노동당 승리', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '보수당 승리', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 정당', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '프랑스 대선, 마크롱 후계자는?', '차기 프랑스 대선에서 승리할 정치인을 예측합니다.', '정치', 'active', v_admin_id, NOW() + INTERVAL '250 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '중도 진영', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '우파 진영', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '좌파 진영', 0, 0, NOW());

  -- 경제 카테고리 (10개)
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '비트코인이 2025년 내 10만 달러를 돌파할까?', '2025년 안에 비트코인 가격이 10만 달러를 넘을지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '180 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '한국은행 기준금리, 2025년 말 수준은?', '2025년 12월 한국은행 기준금리 수준을 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '365 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '3.0% 이상', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '2.5~2.99%', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '2.5% 미만', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '삼성전자 주가, 연말까지 10만원 돌파할까?', '2025년 말까지 삼성전자 주가가 10만원을 넘을지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '300 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '원달러 환율, 올해 1,400원 돌파할까?', '2025년 내 원달러 환율이 1,400원을 넘을지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '200 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '테슬라 시가총액, 애플을 추월할까?', '2025년 내 테슬라의 시가총액이 애플을 넘어설지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '270 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '국내 소비자물가 상승률, 연말까지 2% 이하로 안정될까?', '2025년 12월 소비자물가 상승률이 2% 이하가 될지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '330 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '부동산 시장, 올해 회복세를 보일까?', '2025년 국내 부동산 시장이 회복세로 전환될지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '150 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '넷플릭스가 디즈니+ 구독자 수를 추월할까?', '2025년 내 넷플릭스의 전세계 구독자 수가 디즈니+를 넘어설지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '240 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '애플이 자체 검색엔진을 출시할까?', '2025년 내 애플이 구글을 대체할 자체 검색엔진을 발표할지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '280 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '국내 최저임금, 1만원 시대 돌입할까?', '2026년 적용 최저임금이 시간당 1만원 이상으로 결정될지 예측합니다.', '경제', 'active', v_admin_id, NOW() + INTERVAL '120 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  -- 스포츠 카테고리 (10개)
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, 'KBO 2025 시즌 우승팀은?', '2025 KBO 리그 우승팀을 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '210 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, 'KIA', 0, 0, NOW()), (gen_random_uuid(), v_market_id, 'LG', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '삼성', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 팀', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '손흥민이 EPL 득점왕을 차지할까?', '2024-25 시즌 EPL에서 손흥민이 득점왕을 차지할지 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '90 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025 챔피언스리그 우승팀은?', '2024-25 시즌 UEFA 챔피언스리그 우승팀을 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '150 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '맨시티', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '레알 마드리드', 0, 0, NOW()), (gen_random_uuid(), v_market_id, 'PSG', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 팀', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, 'NBA 2025 챔피언은?', '2024-25 시즌 NBA 챔피언십 우승팀을 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '180 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '보스턴', 0, 0, NOW()), (gen_random_uuid(), v_market_id, 'LA 레이커스', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '덴버', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 팀', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '메이저리그, 오타니가 MVP를 또 받을까?', '2025 시즌 메이저리그에서 오타니 쇼헤이가 MVP를 수상할지 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '250 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025 전미 오픈 남자 단식 우승자는?', '2025 US 오픈 테니스 남자 단식 우승자를 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '220 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '조코비치', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '알카라스', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '시너', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 선수', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '한국 축구 국가대표팀, 2026 월드컵 본선 진출할까?', '한국이 2026 FIFA 월드컵 본선에 진출할지 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '300 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, 'F1 2025 드라이버 챔피언은?', '2025 시즌 포뮬러 원 드라이버 챔피언을 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '280 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '페르스타펜', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '해밀턴', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '르클레르', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 드라이버', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025 윔블던 여자 단식 우승자는?', '2025 윔블던 테니스 여자 단식 우승자를 예측합니다.', '스포츠', 'active', v_admin_id, NOW() + INTERVAL '160 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '스비아텍', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '사발렌카', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '가우프', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 선수', 0, 0, NOW());

  -- 연예 카테고리 (10개)
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025 아카데미 작품상 수상작은?', '제97회 아카데미 시상식 작품상 수상작을 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '60 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '오펜하이머', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '킬러스 오브 더 플라워 문', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '바비', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 작품', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, 'BTS 완전체 컴백이 2025년에 이뤄질까?', 'BTS 멤버 전원의 군 복무 완료 후 완전체 컴백이 올해 이뤄질지 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '200 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '넷플릭스 오리지널 한국 드라마가 에미상을 받을까?', '2025년 에미상에서 넷플릭스 한국 오리지널이 수상할지 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '250 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025 그래미 올해의 앨범은?', '제67회 그래미 어워드 올해의 앨범 수상작을 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '45 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '테일러 스위프트', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '비욘세', 0, 0, NOW()), (gen_random_uuid(), v_market_id, 'SZA', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 아티스트', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '마블 시네마틱 유니버스 Phase 6, 흥행에 성공할까?', 'MCU Phase 6 첫 작품들의 박스오피스 성공 여부를 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '180 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025 칸 영화제 황금종려상은 한국 영화가 받을까?', '제78회 칸 영화제에서 한국 영화가 황금종려상을 수상할지 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '130 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '디즈니+가 국내 OTT 점유율 1위를 차지할까?', '2025년 말 기준 디즈니+가 국내 OTT 시장 점유율 1위가 될지 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '300 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '뉴진스가 빌보드 핫100 1위를 달성할까?', '2025년 내 뉴진스가 빌보드 핫100 차트 1위를 기록할지 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '220 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '블랙핑크 재계약이 성사될까?', '블랙핑크 멤버 전원의 YG와 재계약 성사 여부를 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '90 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '전원 재계약', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '일부 재계약', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '전원 불발', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '2025 골든글로브 드라마 부문 작품상은?', '제82회 골든글로브 시상식 드라마 부문 작품상 수상작을 예측합니다.', '연예', 'active', v_admin_id, NOW() + INTERVAL '30 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, 'succession', 0, 0, NOW()), (gen_random_uuid(), v_market_id, 'The Last of Us', 0, 0, NOW()), (gen_random_uuid(), v_market_id, 'The Crown', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '기타 작품', 0, 0, NOW());

  -- 기술 카테고리 (10개)
  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, 'GPT-5가 2025년 내 출시될까?', 'OpenAI가 2025년 안에 GPT-5를 정식 출시할지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '270 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '애플 비전 프로가 국내 출시될까?', 'Apple Vision Pro가 2025년 내 한국에 정식 출시될지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '200 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '삼성전자가 3나노 공정 양산에 성공할까?', '삼성전자가 2025년 내 3나노 반도체 공정 대량 양산에 성공할지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '240 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '테슬라 완전자율주행이 레벨5를 달성할까?', '테슬라 FSD가 2025년 내 레벨5 자율주행을 인증받을지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '300 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '메타가 AR 글래스를 상용화할까?', 'Meta가 2025년 내 증강현실 안경을 일반 소비자용으로 출시할지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '280 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, 'SpaceX 스타십이 달 착륙에 성공할까?', 'SpaceX의 스타십이 2025년 내 달 표면 착륙에 성공할지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '320 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '양자컴퓨터가 실용화 단계에 진입할까?', '2025년 내 상용 양자컴퓨터가 실제 업무에 활용되기 시작할지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '260 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '국내 AI 반도체 기업이 글로벌 TOP10에 진입할까?', '한국 AI 반도체 기업이 2025년 내 세계 시장점유율 10위 안에 들지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '330 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '6G 통신 기술이 상용화될까?', '2025년 내 6세대 이동통신 기술이 일부 지역에서 상용화될지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '310 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  v_market_id := gen_random_uuid();
  INSERT INTO markets (id, title, description, category, status, creator_id, ends_at, created_at)
  VALUES (v_market_id, '휴머노이드 로봇이 가정용으로 출시될까?', '2025년 내 휴머노이드 로봇이 일반 가정용으로 판매되기 시작할지 예측합니다.', '기술', 'active', v_admin_id, NOW() + INTERVAL '290 days', NOW());
  INSERT INTO market_options (id, market_id, title, total_predictions, total_amount, created_at)
  VALUES (gen_random_uuid(), v_market_id, '예', 0, 0, NOW()), (gen_random_uuid(), v_market_id, '아니오', 0, 0, NOW());

  RAISE NOTICE '50개의 예측 시장이 성공적으로 생성되었습니다!';
END $$;
