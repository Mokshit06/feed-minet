/*
  Warnings:

  - You are about to drop the column `currentCoords` on the `Pickup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pickup" DROP COLUMN "currentCoords",
ADD COLUMN     "donatorCoords" INTEGER[],
ADD COLUMN     "pickupCoords" INTEGER[];
