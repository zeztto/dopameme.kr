-- Version JWT sessions so account restrictions can invalidate existing tokens.
ALTER TABLE "users" ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;
