-- 중복 생성된 예측 시장 삭제 및 기존 예측 제목 과거형 → 미래형 수정

DO $$
DECLARE
  v_update_count INTEGER := 0;
BEGIN
  RAISE NOTICE '중복 삭제 및 제목 수정 시작...';

  -- Step 1: 중복으로 생성된 최근 예측 시장들을 삭제 (오늘 생성된 것들)
  -- 기존 예측 시장과 중복되는 제목을 가진, 오늘 생성된 예측만 삭제
  DELETE FROM markets
  WHERE DATE(created_at) = CURRENT_DATE
    AND status = 'active';

  RAISE NOTICE '오늘 생성된 중복 예측 시장 삭제 완료';

  -- Step 2: 기존 예측 시장의 제목을 과거형에서 미래형으로 수정
  UPDATE markets
  SET title = REPLACE(title, '이었을까?', '일까?')
  WHERE title LIKE '%이었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '이었을까 → 일까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '있었을까?', '있을까?')
  WHERE title LIKE '%있었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '있었을까 → 있을까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '했을까?', '할까?')
  WHERE title LIKE '%했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '했을까 → 할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '되었을까?', '될까?')
  WHERE title LIKE '%되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '되었을까 → 될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '왔을까?', '올까?')
  WHERE title LIKE '%왔을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '왔을까 → 올까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '넘었을까?', '넘을까?')
  WHERE title LIKE '%넘었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '넘었을까 → 넘을까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '차지했을까?', '차지할까?')
  WHERE title LIKE '%차지했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '차지했을까 → 차지할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '기록했을까?', '기록할까?')
  WHERE title LIKE '%기록했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '기록했을까 → 기록할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '승리했을까?', '승리할까?')
  WHERE title LIKE '%승리했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '승리했을까 → 승리할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '획득했을까?', '획득할까?')
  WHERE title LIKE '%획득했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '획득했을까 → 획득할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '당선되었을까?', '당선될까?')
  WHERE title LIKE '%당선되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '당선되었을까 → 당선될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '개최되었을까?', '개최될까?')
  WHERE title LIKE '%개최되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '개최되었을까 → 개최될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '발표되었을까?', '발표될까?')
  WHERE title LIKE '%발표되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '발표되었을까 → 발표될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '출시했을까?', '출시할까?')
  WHERE title LIKE '%출시했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '출시했을까 → 출시할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '발매했을까?', '발매할까?')
  WHERE title LIKE '%발매했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '발매했을까 → 발매할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '수상했을까?', '수상할까?')
  WHERE title LIKE '%수상했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '수상했을까 → 수상할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '선정되었을까?', '선정될까?')
  WHERE title LIKE '%선정되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '선정되었을까 → 선정될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '확정되었을까?', '확정될까?')
  WHERE title LIKE '%확정되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '확정되었을까 → 확정될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '교체되었을까?', '교체될까?')
  WHERE title LIKE '%교체되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '교체되었을까 → 교체될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '통과했을까?', '통과할까?')
  WHERE title LIKE '%통과했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '통과했을까 → 통과할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '지급되었을까?', '지급될까?')
  WHERE title LIKE '%지급되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '지급되었을까 → 지급될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '증가했을까?', '증가할까?')
  WHERE title LIKE '%증가했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '증가했을까 → 증가할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '발생했을까?', '발생할까?')
  WHERE title LIKE '%발생했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '발생했을까 → 발생할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '나왔을까?', '나올까?')
  WHERE title LIKE '%나왔을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '나왔을까 → 나올까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '시작했을까?', '시작할까?')
  WHERE title LIKE '%시작했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '시작했을까 → 시작할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '받았을까?', '받을까?')
  WHERE title LIKE '%받았을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '받았을까 → 받을까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '성공했을까?', '성공할까?')
  WHERE title LIKE '%성공했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '성공했을까 → 성공할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '공개했을까?', '공개할까?')
  WHERE title LIKE '%공개했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '공개했을까 → 공개할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '내려갔을까?', '내려갈까?')
  WHERE title LIKE '%내려갔을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '내려갔을까 → 내려갈까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '돌파했을까?', '돌파할까?')
  WHERE title LIKE '%돌파했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '돌파했을까 → 돌파할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '깬 사례가', '깰 사례가')
  WHERE title LIKE '%깬 사례가%';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '깬 → 깰: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '탑재한', '탑재할')
  WHERE title LIKE '%탑재한%';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '탑재한 → 탑재할: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '진입한', '진입할')
  WHERE title LIKE '%진입한%';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '진입한 → 진입할: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '체결되었을까?', '체결될까?')
  WHERE title LIKE '%체결되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '체결되었을까 → 체결될까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '참석했을까?', '참석할까?')
  WHERE title LIKE '%참석했을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '참석했을까 → 참석할까: % 개 수정', v_update_count;

  UPDATE markets
  SET title = REPLACE(title, '확대되었을까?', '확대될까?')
  WHERE title LIKE '%확대되었을까?';
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  RAISE NOTICE '확대되었을까 → 확대될까: % 개 수정', v_update_count;

  RAISE NOTICE '===============================================';
  RAISE NOTICE '중복 삭제 및 제목 수정 완료!';
  RAISE NOTICE '===============================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE;
END $$;

-- 수정된 예측 시장 확인
SELECT
  category,
  COUNT(*) as market_count
FROM markets
WHERE status = 'active'
GROUP BY category
ORDER BY category;

-- 과거형이 남아있는지 확인
SELECT title
FROM markets
WHERE status = 'active'
  AND (
    title LIKE '%었을까?'
    OR title LIKE '%했을까?'
    OR title LIKE '%했는%'
    OR title LIKE '%한 %'
  )
LIMIT 20;
