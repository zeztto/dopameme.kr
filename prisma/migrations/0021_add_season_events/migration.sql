-- Store recurring season/championship events and participant score snapshots.
CREATE TABLE "season_events" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "reward_dpmm" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "season_events_window_check" CHECK ("ends_at" > "starts_at"),
    CONSTRAINT "season_events_reward_dpmm_check" CHECK ("reward_dpmm" >= 0),
    CONSTRAINT "season_events_type_check" CHECK ("type" IN ('monthly', 'quarterly')),
    CONSTRAINT "season_events_status_check" CHECK ("status" IN ('active', 'completed', 'archived'))
);

CREATE TABLE "user_season_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "prediction_count" INTEGER NOT NULL DEFAULT 0,
    "win_count" INTEGER NOT NULL DEFAULT 0,
    "stake_amount" INTEGER NOT NULL DEFAULT 0,
    "profit_amount" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_season_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_season_progress_score_check" CHECK ("score" >= 0),
    CONSTRAINT "user_season_progress_prediction_count_check" CHECK ("prediction_count" >= 0),
    CONSTRAINT "user_season_progress_win_count_check" CHECK ("win_count" >= 0),
    CONSTRAINT "user_season_progress_stake_amount_check" CHECK ("stake_amount" >= 0),
    CONSTRAINT "user_season_progress_comment_count_check" CHECK ("comment_count" >= 0)
);

CREATE UNIQUE INDEX "season_events_code_key"
ON "season_events"("code");

CREATE INDEX "season_events_type_starts_at_idx"
ON "season_events"("type", "starts_at");

CREATE INDEX "season_events_status_starts_at_ends_at_idx"
ON "season_events"("status", "starts_at", "ends_at");

CREATE INDEX "season_events_sort_order_idx"
ON "season_events"("sort_order");

CREATE UNIQUE INDEX "user_season_progress_user_id_season_id_key"
ON "user_season_progress"("user_id", "season_id");

CREATE INDEX "user_season_progress_season_id_score_idx"
ON "user_season_progress"("season_id", "score");

CREATE INDEX "user_season_progress_user_id_idx"
ON "user_season_progress"("user_id");

ALTER TABLE "user_season_progress"
ADD CONSTRAINT "user_season_progress_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_season_progress"
ADD CONSTRAINT "user_season_progress_season_id_fkey"
FOREIGN KEY ("season_id") REFERENCES "season_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
