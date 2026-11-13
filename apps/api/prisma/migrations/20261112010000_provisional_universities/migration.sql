ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
ALTER TABLE "University" ADD COLUMN "approvalStatus" "RequestStatus" NOT NULL DEFAULT 'APPROVED', ADD COLUMN "createdById" TEXT;
ALTER TABLE "UniversityRequest" ADD COLUMN "abbreviation" TEXT, ADD COLUMN "reviewNotes" TEXT, ADD COLUMN "universityId" TEXT, ADD COLUMN "facultyId" TEXT, ADD COLUMN "careerId" TEXT;
CREATE UNIQUE INDEX "UniversityRequest_universityId_key" ON "UniversityRequest"("universityId");
ALTER TABLE "UniversityRequest" ADD CONSTRAINT "UniversityRequest_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;
