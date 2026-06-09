-- Store browser Web Push subscriptions for authenticated users.
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "failed_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "push_subscriptions_endpoint_key"
ON "push_subscriptions"("endpoint");

CREATE INDEX "push_subscriptions_user_id_enabled_idx"
ON "push_subscriptions"("user_id", "enabled");

CREATE INDEX "push_subscriptions_updated_at_idx"
ON "push_subscriptions"("updated_at");

ALTER TABLE "push_subscriptions"
ADD CONSTRAINT "push_subscriptions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "push_subscriptions"
ADD CONSTRAINT "push_subscriptions_failure_count_non_negative_check"
CHECK ("failure_count" >= 0);
