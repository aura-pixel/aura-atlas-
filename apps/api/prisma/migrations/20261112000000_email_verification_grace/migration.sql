BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Give existing accounts five days from activation. New accounts receive
-- their own five-day period from creation, independently of later logins.
ALTER TABLE "User" ADD COLUMN "emailVerificationDeadline" TIMESTAMP(3)
  NOT NULL DEFAULT (CURRENT_TIMESTAMP + '5 days'::interval);

COMMIT;
