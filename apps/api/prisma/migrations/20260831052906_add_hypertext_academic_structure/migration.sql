/*
  Warnings:

  - You are about to drop the column `academicStructure` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `academicStructureConfirmed` on the `Subject` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subjectId,userId]` on the table `Hypertext` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Hypertext" ADD COLUMN     "academicStructure" JSONB,
ADD COLUMN     "academicStructureConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "academicStructure",
DROP COLUMN "academicStructureConfirmed";

-- CreateIndex
CREATE UNIQUE INDEX "Hypertext_subjectId_userId_key" ON "Hypertext"("subjectId", "userId");
