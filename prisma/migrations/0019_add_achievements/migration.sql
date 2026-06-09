-- Store gamification achievement definitions and per-user progress.
CREATE TABLE "achievement_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "reward_dpmm" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "achievement_definitions_threshold_check" CHECK ("threshold" > 0),
    CONSTRAINT "achievement_definitions_reward_dpmm_check" CHECK ("reward_dpmm" >= 0)
);

CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "unlocked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_achievements_progress_check" CHECK ("progress" >= 0)
);

CREATE UNIQUE INDEX "achievement_definitions_code_key"
ON "achievement_definitions"("code");

CREATE INDEX "achievement_definitions_category_is_active_idx"
ON "achievement_definitions"("category", "is_active");

CREATE INDEX "achievement_definitions_sort_order_idx"
ON "achievement_definitions"("sort_order");

CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key"
ON "user_achievements"("user_id", "achievement_id");

CREATE INDEX "user_achievements_user_id_unlocked_at_idx"
ON "user_achievements"("user_id", "unlocked_at");

CREATE INDEX "user_achievements_achievement_id_idx"
ON "user_achievements"("achievement_id");

ALTER TABLE "user_achievements"
ADD CONSTRAINT "user_achievements_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_achievements"
ADD CONSTRAINT "user_achievements_achievement_id_fkey"
FOREIGN KEY ("achievement_id") REFERENCES "achievement_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
