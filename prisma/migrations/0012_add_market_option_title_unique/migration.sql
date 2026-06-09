-- Prevent duplicate option labels within the same market.
CREATE UNIQUE INDEX "market_options_market_id_title_key"
ON "market_options"("market_id", "title");
