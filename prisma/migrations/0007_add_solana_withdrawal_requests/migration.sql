-- Track user DPMM withdrawal requests from the off-chain ledger to an external Solana wallet.
CREATE TABLE "solana_withdrawal_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "cluster" TEXT NOT NULL DEFAULT 'devnet',
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tx_signature" TEXT,
    "admin_id" TEXT,
    "admin_note" TEXT,
    "user_note" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solana_withdrawal_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "solana_withdrawal_requests_tx_signature_key"
ON "solana_withdrawal_requests"("tx_signature");

CREATE INDEX "solana_withdrawal_requests_user_id_idx"
ON "solana_withdrawal_requests"("user_id");

CREATE INDEX "solana_withdrawal_requests_admin_id_idx"
ON "solana_withdrawal_requests"("admin_id");

CREATE INDEX "solana_withdrawal_requests_status_idx"
ON "solana_withdrawal_requests"("status");

CREATE INDEX "solana_withdrawal_requests_requested_at_idx"
ON "solana_withdrawal_requests"("requested_at");

CREATE INDEX "solana_withdrawal_requests_wallet_address_idx"
ON "solana_withdrawal_requests"("wallet_address");

CREATE UNIQUE INDEX "solana_withdrawal_requests_user_active_key"
ON "solana_withdrawal_requests"("user_id")
WHERE "status" IN ('pending', 'approved', 'submitted');

ALTER TABLE "solana_withdrawal_requests"
ADD CONSTRAINT "solana_withdrawal_requests_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "solana_withdrawal_requests"
ADD CONSTRAINT "solana_withdrawal_requests_admin_id_fkey"
FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
