-- CreateEnum
CREATE TYPE "HypertextTheme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "Hypertext" ADD COLUMN     "theme" "HypertextTheme" NOT NULL DEFAULT 'LIGHT',
ALTER COLUMN "primaryColor" SET DEFAULT '#1A0407',
ALTER COLUMN "secondaryColor" SET DEFAULT '#F8F6EB';
