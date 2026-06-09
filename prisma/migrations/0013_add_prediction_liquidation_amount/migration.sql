-- Track cumulative stake reduced through partial liquidation.
ALTER TABLE "predictions"
ADD COLUMN "liquidated_amount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "predictions"
ADD CONSTRAINT "predictions_liquidated_amount_non_negative_check"
CHECK ("liquidated_amount" >= 0);

ALTER TABLE "predictions"
ADD CONSTRAINT "predictions_amount_non_negative_check"
CHECK ("amount" >= 0);

ALTER TABLE "market_options"
ADD CONSTRAINT "market_options_total_amount_non_negative_check"
CHECK ("total_amount" >= 0);
