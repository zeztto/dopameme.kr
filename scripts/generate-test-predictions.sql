-- 테스트 계정 100개가 무작위로 예측에 참여하는 스크립트
-- 각 계정은 최소 30개 이상의 예측에 참여
-- 베팅 금액: 500~2000 DPMM

DO $$
DECLARE
  v_test_user RECORD;
  v_market RECORD;
  v_option RECORD;
  v_bet_amount INTEGER;
  v_prediction_id TEXT;
  v_predictions_count INTEGER;
  v_target_predictions INTEGER;
  v_selected_markets TEXT[];
  v_market_id TEXT;
  v_user_count INTEGER := 0;
  v_total_predictions INTEGER := 0;
BEGIN
  -- 모든 테스트 계정 가져오기
  FOR v_test_user IN
    SELECT id, name, dpmm_balance
    FROM users
    WHERE role = 'test'
    ORDER BY id
  LOOP
    v_user_count := v_user_count + 1;

    -- 각 사용자가 참여할 예측 개수 랜덤 설정 (30~50개)
    v_target_predictions := 30 + floor(random() * 21)::INTEGER;

    -- 사용 가능한 모든 활성 마켓 ID 가져오기
    v_selected_markets := ARRAY(
      SELECT id
      FROM markets
      WHERE status = 'active'
      ORDER BY random()
      LIMIT v_target_predictions
    );

    v_predictions_count := 0;

    -- 선택된 마켓들에 대해 예측 생성
    FOREACH v_market_id IN ARRAY v_selected_markets
    LOOP
      -- 마켓의 옵션 중 하나를 랜덤으로 선택
      SELECT id, market_id INTO v_option
      FROM market_options
      WHERE market_id = v_market_id
      ORDER BY random()
      LIMIT 1;

      IF v_option.id IS NOT NULL THEN
        -- 베팅 금액 랜덤 생성 (500~2000 DPMM)
        v_bet_amount := 500 + floor(random() * 1501)::INTEGER;

        -- 사용자 잔고 확인
        SELECT dpmm_balance INTO v_test_user.dpmm_balance
        FROM users
        WHERE id = v_test_user.id;

        -- 잔고가 충분한 경우만 예측 생성
        IF v_test_user.dpmm_balance >= v_bet_amount THEN
          -- 예측 ID 생성
          v_prediction_id := gen_random_uuid();

          -- 예측 레코드 삽입
          INSERT INTO predictions (
            id,
            user_id,
            market_id,
            option_id,
            amount,
            created_at,
            resolved
          ) VALUES (
            v_prediction_id,
            v_test_user.id,
            v_market_id,
            v_option.id,
            v_bet_amount,
            NOW() - (random() * interval '7 days'), -- 최근 7일 이내 랜덤 시간
            0 -- 아직 해결되지 않음
          );

          -- 사용자 잔고 차감
          UPDATE users
          SET dpmm_balance = dpmm_balance - v_bet_amount
          WHERE id = v_test_user.id;

          -- 마켓 옵션 통계 업데이트
          UPDATE market_options
          SET
            total_predictions = total_predictions + 1,
            total_amount = total_amount + v_bet_amount
          WHERE id = v_option.id;

          v_predictions_count := v_predictions_count + 1;
          v_total_predictions := v_total_predictions + 1;
        END IF;
      END IF;
    END LOOP;

    -- 진행 상황 출력
    IF v_user_count % 10 = 0 THEN
      RAISE NOTICE '진행 중: % / 100 계정 완료, 총 % 예측 생성', v_user_count, v_total_predictions;
    END IF;
  END LOOP;

  -- 최종 결과 출력
  RAISE NOTICE '===============================================';
  RAISE NOTICE '테스트 예측 생성 완료!';
  RAISE NOTICE '총 % 계정이 % 개의 예측에 참여했습니다.', v_user_count, v_total_predictions;
  RAISE NOTICE '평균 계정당 예측 수: %', round(v_total_predictions::NUMERIC / v_user_count, 2);
  RAISE NOTICE '===============================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE;
END $$;

-- 생성된 예측 통계 확인
SELECT
  '예측 통계' as category,
  COUNT(*) as total_predictions,
  SUM(amount) as total_bet_amount,
  AVG(amount)::INTEGER as avg_bet_amount,
  MIN(amount) as min_bet,
  MAX(amount) as max_bet
FROM predictions
WHERE resolved = 0;

-- 사용자별 예측 수 통계
SELECT
  '사용자별 통계' as category,
  COUNT(DISTINCT user_id) as active_users,
  AVG(prediction_count)::INTEGER as avg_predictions_per_user,
  MIN(prediction_count) as min_predictions,
  MAX(prediction_count) as max_predictions
FROM (
  SELECT user_id, COUNT(*) as prediction_count
  FROM predictions
  WHERE resolved = 0
  GROUP BY user_id
) user_stats;

-- 마켓별 참여 통계
SELECT
  m.title,
  m.category,
  COUNT(p.id) as total_predictions,
  SUM(p.amount) as total_amount,
  COUNT(DISTINCT p.user_id) as unique_users
FROM markets m
LEFT JOIN predictions p ON m.id = p.market_id AND p.resolved = 0
WHERE m.status = 'active'
GROUP BY m.id, m.title, m.category
ORDER BY total_predictions DESC
LIMIT 10;
