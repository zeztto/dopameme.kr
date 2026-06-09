-- Add fixed-price secondary market listings for whole prediction positions.
CREATE TABLE "position_listings" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "buyer_id" TEXT,
    "prediction_id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sold_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "position_listings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "position_listings_seller_id_idx"
ON "position_listings"("seller_id");

CREATE INDEX "position_listings_buyer_id_idx"
ON "position_listings"("buyer_id");

CREATE INDEX "position_listings_prediction_id_idx"
ON "position_listings"("prediction_id");

CREATE INDEX "position_listings_market_id_status_created_at_idx"
ON "position_listings"("market_id", "status", "created_at");

CREATE INDEX "position_listings_option_id_idx"
ON "position_listings"("option_id");

CREATE INDEX "position_listings_status_idx"
ON "position_listings"("status");

CREATE UNIQUE INDEX "position_listings_one_active_per_prediction_idx"
ON "position_listings"("prediction_id")
WHERE "status" = 'active';

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_seller_id_fkey"
FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_buyer_id_fkey"
FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_prediction_id_fkey"
FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_market_id_fkey"
FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_option_id_fkey"
FOREIGN KEY ("option_id") REFERENCES "market_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_amount_positive_check"
CHECK ("amount" > 0);

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_price_positive_check"
CHECK ("price" > 0);

ALTER TABLE "position_listings"
ADD CONSTRAINT "position_listings_status_check"
CHECK ("status" IN ('active', 'sold', 'cancelled'));
