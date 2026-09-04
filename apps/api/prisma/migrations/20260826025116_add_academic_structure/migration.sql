-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "academicStructure" JSONB,
ADD COLUMN     "academicStructureConfirmed" BOOLEAN NOT NULL DEFAULT false;
