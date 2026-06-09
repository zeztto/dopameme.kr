-- Add user follow relationships for community graph features.
CREATE TABLE "user_follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_follows_follower_id_following_id_key"
ON "user_follows"("follower_id", "following_id");

CREATE INDEX "user_follows_follower_id_idx"
ON "user_follows"("follower_id");

CREATE INDEX "user_follows_following_id_idx"
ON "user_follows"("following_id");

CREATE INDEX "user_follows_created_at_idx"
ON "user_follows"("created_at");

ALTER TABLE "user_follows"
ADD CONSTRAINT "user_follows_follower_id_fkey"
FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_follows"
ADD CONSTRAINT "user_follows_following_id_fkey"
FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_follows"
ADD CONSTRAINT "user_follows_no_self_follow_check"
CHECK ("follower_id" <> "following_id");
