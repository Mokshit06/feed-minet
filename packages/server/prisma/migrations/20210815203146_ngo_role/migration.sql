/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Ngo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "user_role" ADD VALUE 'NGO';

-- AlterTable
ALTER TABLE "Ngo" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ngo_ownerId_unique" ON "Ngo"("ownerId");

-- AddForeignKey
ALTER TABLE "Ngo" ADD FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
