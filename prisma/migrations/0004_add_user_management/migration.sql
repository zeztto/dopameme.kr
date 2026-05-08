-- Add member-management fields and an auditable DPMM adjustment ledger.
ALTER TABLE "users" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

CREATE TABLE "user_balance_adjustments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_balance_adjustments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "user_balance_adjustments_user_id_idx" ON "user_balance_adjustments"("user_id");
CREATE INDEX "user_balance_adjustments_admin_id_idx" ON "user_balance_adjustments"("admin_id");
CREATE INDEX "user_balance_adjustments_created_at_idx" ON "user_balance_adjustments"("created_at");

ALTER TABLE "user_balance_adjustments"
ADD CONSTRAINT "user_balance_adjustments_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_balance_adjustments"
ADD CONSTRAINT "user_balance_adjustments_admin_id_fkey"
FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
