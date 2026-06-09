-- Add per-market virtual-liquidity AMM configuration.
CREATE TABLE "market_amm_configs" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "virtual_liquidity" INTEGER NOT NULL DEFAULT 5000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_amm_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "market_amm_configs_market_id_key"
ON "market_amm_configs"("market_id");

CREATE INDEX "market_amm_configs_enabled_idx"
ON "market_amm_configs"("enabled");

ALTER TABLE "market_amm_configs"
ADD CONSTRAINT "market_amm_configs_market_id_fkey"
FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_amm_configs"
ADD CONSTRAINT "market_amm_configs_virtual_liquidity_non_negative_check"
CHECK ("virtual_liquidity" >= 0);

INSERT INTO "market_amm_configs" (
    "id",
    "market_id",
    "enabled",
    "virtual_liquidity",
    "created_at",
    "updated_at"
)
SELECT
    'amm-config-' || "id",
    "id",
    true,
    5000,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "markets";
