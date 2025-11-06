-- 수수료 소각용 계정 생성
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
