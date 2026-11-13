BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
CREATE TYPE "InstitutionRequestKind" AS ENUM ('UNIVERSITY', 'FACULTY');
ALTER TABLE "Faculty" ADD COLUMN "approvalStatus" "RequestStatus" NOT NULL DEFAULT 'APPROVED', ADD COLUMN "createdById" TEXT;
ALTER TABLE "UniversityRequest" ADD COLUMN "kind" "InstitutionRequestKind" NOT NULL DEFAULT 'UNIVERSITY';
DROP INDEX "UniversityRequest_universityId_key";
COMMIT;
