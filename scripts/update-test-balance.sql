-- 모든 테스트 계정의 DPM 잔고를 100만으로 설정
UPDATE users
SET dpm_balance = 1000000
WHERE role = 'test';
