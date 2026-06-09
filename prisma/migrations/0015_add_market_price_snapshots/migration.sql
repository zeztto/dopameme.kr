-- Store option probability snapshots after market-moving events.
CREATE TABLE "market_price_snapshots" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "probability_bps" INTEGER NOT NULL,
    "option_amount" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_price_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "market_price_snapshots_market_id_created_at_idx"
ON "market_price_snapshots"("market_id", "created_at");

CREATE INDEX "market_price_snapshots_option_id_created_at_idx"
ON "market_price_snapshots"("option_id", "created_at");

CREATE INDEX "market_price_snapshots_source_idx"
ON "market_price_snapshots"("source");

ALTER TABLE "market_price_snapshots"
ADD CONSTRAINT "market_price_snapshots_market_id_fkey"
FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_price_snapshots"
ADD CONSTRAINT "market_price_snapshots_option_id_fkey"
FOREIGN KEY ("option_id") REFERENCES "market_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_price_snapshots"
ADD CONSTRAINT "market_price_snapshots_probability_bps_check"
CHECK ("probability_bps" >= 0 AND "probability_bps" <= 10000);

ALTER TABLE "market_price_snapshots"
ADD CONSTRAINT "market_price_snapshots_option_amount_non_negative_check"
CHECK ("option_amount" >= 0);

ALTER TABLE "market_price_snapshots"
ADD CONSTRAINT "market_price_snapshots_total_amount_non_negative_check"
CHECK ("total_amount" >= 0);
