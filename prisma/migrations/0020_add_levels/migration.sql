-- Store level definitions and per-user XP/level snapshots.
CREATE TABLE "level_definitions" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "min_xp" INTEGER NOT NULL,
    "reward_dpmm" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_definitions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "level_definitions_level_check" CHECK ("level" > 0),
    CONSTRAINT "level_definitions_min_xp_check" CHECK ("min_xp" >= 0),
    CONSTRAINT "level_definitions_reward_dpmm_check" CHECK ("reward_dpmm" >= 0)
);

CREATE TABLE "user_levels" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "rewarded_level" INTEGER NOT NULL DEFAULT 1,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_levels_xp_check" CHECK ("xp" >= 0),
    CONSTRAINT "user_levels_level_check" CHECK ("level" > 0),
    CONSTRAINT "user_levels_rewarded_level_check" CHECK ("rewarded_level" > 0)
);

CREATE UNIQUE INDEX "level_definitions_level_key"
ON "level_definitions"("level");

CREATE INDEX "level_definitions_min_xp_idx"
ON "level_definitions"("min_xp");

CREATE INDEX "level_definitions_is_active_idx"
ON "level_definitions"("is_active");

CREATE UNIQUE INDEX "user_levels_user_id_key"
ON "user_levels"("user_id");

CREATE INDEX "user_levels_level_idx"
ON "user_levels"("level");

CREATE INDEX "user_levels_xp_idx"
ON "user_levels"("xp");

ALTER TABLE "user_levels"
ADD CONSTRAINT "user_levels_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
