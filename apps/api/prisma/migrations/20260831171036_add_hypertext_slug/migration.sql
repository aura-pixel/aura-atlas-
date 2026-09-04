/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Hypertext` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Hypertext" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Hypertext_slug_key" ON "Hypertext"("slug");
