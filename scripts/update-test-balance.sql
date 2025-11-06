-- 모든 테스트 계정의 DPMM 잔고를 100만으로 설정
UPDATE users
SET dpmm_balance = 1000000
WHERE role = 'test';
