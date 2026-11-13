BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

CREATE TABLE "SubjectProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT,
    "abbreviation" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SubjectProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubjectProfile_userId_subjectId_key" ON "SubjectProfile"("userId", "subjectId");
CREATE INDEX "SubjectProfile_subjectId_idx" ON "SubjectProfile"("subjectId");
ALTER TABLE "SubjectProfile" ADD CONSTRAINT "SubjectProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubjectProfile" ADD CONSTRAINT "SubjectProfile_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
