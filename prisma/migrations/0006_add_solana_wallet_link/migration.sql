-- Store verified Solana wallet links and short-lived wallet-link nonces.
CREATE TABLE "solana_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cluster" TEXT NOT NULL DEFAULT 'devnet',
    "wallet_provider" TEXT,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solana_wallets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "solana_wallet_nonces" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cluster" TEXT NOT NULL DEFAULT 'devnet',
    "nonce" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solana_wallet_nonces_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "solana_wallets_user_id_key" ON "solana_wallets"("user_id");
CREATE UNIQUE INDEX "solana_wallets_address_key" ON "solana_wallets"("address");
CREATE INDEX "solana_wallets_cluster_idx" ON "solana_wallets"("cluster");
CREATE UNIQUE INDEX "solana_wallet_nonces_nonce_key" ON "solana_wallet_nonces"("nonce");
CREATE INDEX "solana_wallet_nonces_user_id_idx" ON "solana_wallet_nonces"("user_id");
CREATE INDEX "solana_wallet_nonces_address_idx" ON "solana_wallet_nonces"("address");
CREATE INDEX "solana_wallet_nonces_expires_at_idx" ON "solana_wallet_nonces"("expires_at");

ALTER TABLE "solana_wallets"
ADD CONSTRAINT "solana_wallets_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "solana_wallet_nonces"
ADD CONSTRAINT "solana_wallet_nonces_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
