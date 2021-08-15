-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('IDLE', 'COMPLETED', 'ACTIVE');

-- AlterTable
ALTER TABLE "Pickup" ADD COLUMN     "status" "PickupStatus" NOT NULL DEFAULT E'IDLE';
