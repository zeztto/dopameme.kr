ALTER TABLE "markets"
ADD COLUMN "time_zone" TEXT NOT NULL DEFAULT 'Asia/Seoul';

CREATE INDEX "markets_time_zone_idx" ON "markets"("time_zone");
