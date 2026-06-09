-- Store WebAuthn/passkey credentials and short-lived challenges.
CREATE TABLE "webauthn_credentials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT,
    "device_type" TEXT,
    "backed_up" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "webauthn_challenges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webauthn_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webauthn_credentials_credential_id_key"
ON "webauthn_credentials"("credential_id");

CREATE INDEX "webauthn_credentials_user_id_idx"
ON "webauthn_credentials"("user_id");

CREATE INDEX "webauthn_credentials_last_used_at_idx"
ON "webauthn_credentials"("last_used_at");

CREATE UNIQUE INDEX "webauthn_challenges_challenge_key"
ON "webauthn_challenges"("challenge");

CREATE INDEX "webauthn_challenges_user_id_type_expires_at_idx"
ON "webauthn_challenges"("user_id", "type", "expires_at");

CREATE INDEX "webauthn_challenges_email_type_expires_at_idx"
ON "webauthn_challenges"("email", "type", "expires_at");

CREATE INDEX "webauthn_challenges_expires_at_idx"
ON "webauthn_challenges"("expires_at");

ALTER TABLE "webauthn_credentials"
ADD CONSTRAINT "webauthn_credentials_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "webauthn_challenges"
ADD CONSTRAINT "webauthn_challenges_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "webauthn_credentials"
ADD CONSTRAINT "webauthn_credentials_counter_non_negative_check"
CHECK ("counter" >= 0);

ALTER TABLE "webauthn_challenges"
ADD CONSTRAINT "webauthn_challenges_type_check"
CHECK ("type" IN ('registration', 'authentication'));
