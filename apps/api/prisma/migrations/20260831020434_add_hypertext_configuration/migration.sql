-- AlterTable
ALTER TABLE "Hypertext" ADD COLUMN     "fontFamily" TEXT NOT NULL DEFAULT 'Geist',
ADD COLUMN     "primaryColor" TEXT NOT NULL DEFAULT '#7D5DFF',
ADD COLUMN     "secondaryColor" TEXT NOT NULL DEFAULT '#5EE1E6';

-- CreateTable
CREATE TABLE "HypertextAuthor" (
    "id" TEXT NOT NULL,
    "hypertextId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HypertextAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HypertextAuthor_hypertextId_userId_key" ON "HypertextAuthor"("hypertextId", "userId");

-- AddForeignKey
ALTER TABLE "HypertextAuthor" ADD CONSTRAINT "HypertextAuthor_hypertextId_fkey" FOREIGN KEY ("hypertextId") REFERENCES "Hypertext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HypertextAuthor" ADD CONSTRAINT "HypertextAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
