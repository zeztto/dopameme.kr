-- Add append-only DPMM ledger entries for every balance mutation.
CREATE TABLE "dpmm_ledger_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "type" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reason" TEXT,
    "source_type" TEXT,
    "source_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dpmm_ledger_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dpmm_ledger_transactions_user_id_idx"
ON "dpmm_ledger_transactions"("user_id");

CREATE INDEX "dpmm_ledger_transactions_actor_id_idx"
ON "dpmm_ledger_transactions"("actor_id");

CREATE INDEX "dpmm_ledger_transactions_type_idx"
ON "dpmm_ledger_transactions"("type");

CREATE INDEX "dpmm_ledger_transactions_source_type_source_id_idx"
ON "dpmm_ledger_transactions"("source_type", "source_id");

CREATE INDEX "dpmm_ledger_transactions_created_at_idx"
ON "dpmm_ledger_transactions"("created_at");

ALTER TABLE "dpmm_ledger_transactions"
ADD CONSTRAINT "dpmm_ledger_transactions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dpmm_ledger_transactions"
ADD CONSTRAINT "dpmm_ledger_transactions_actor_id_fkey"
FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "dpmm_ledger_transactions" (
    "id",
    "user_id",
    "type",
    "delta",
    "balance_after",
    "reason",
    "source_type",
    "source_id",
    "created_at"
)
SELECT
    'opening-balance-' || "id",
    "id",
    'opening_balance',
    "dpmm_balance",
    "dpmm_balance",
    'Ledger migration opening balance',
    'migration',
    '0008_add_dpmm_ledger_transactions',
    CURRENT_TIMESTAMP
FROM "users"
WHERE "dpmm_balance" <> 0;
