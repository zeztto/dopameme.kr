ALTER TABLE "markets"
ADD COLUMN "region" TEXT NOT NULL DEFAULT 'KR',
ADD COLUMN "language_code" TEXT NOT NULL DEFAULT 'ko';

CREATE INDEX "markets_region_idx" ON "markets"("region");
CREATE INDEX "markets_language_code_idx" ON "markets"("language_code");
