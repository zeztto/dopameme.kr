-- markets 테이블에 hidden 컬럼 추가
-- 관리자가 예측을 가릴 수 있는 기능

ALTER TABLE markets
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

-- 기본값으로 모든 기존 예측은 보이도록 설정
UPDATE markets
SET hidden = FALSE
WHERE hidden IS NULL;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_markets_hidden ON markets(hidden);

-- 확인
SELECT
  COUNT(*) as total_markets,
  SUM(CASE WHEN hidden = TRUE THEN 1 ELSE 0 END) as hidden_count,
  SUM(CASE WHEN hidden = FALSE THEN 1 ELSE 0 END) as visible_count
FROM markets;
