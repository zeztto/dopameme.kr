-- Add market-level community comments.
CREATE TABLE "market_comments" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'visible',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "market_comments_market_id_created_at_idx"
ON "market_comments"("market_id", "created_at");

CREATE INDEX "market_comments_user_id_idx"
ON "market_comments"("user_id");

CREATE INDEX "market_comments_status_idx"
ON "market_comments"("status");

ALTER TABLE "market_comments"
ADD CONSTRAINT "market_comments_market_id_fkey"
FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_comments"
ADD CONSTRAINT "market_comments_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
