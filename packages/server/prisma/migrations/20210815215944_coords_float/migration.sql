-- AlterTable
ALTER TABLE "Ngo" ALTER COLUMN "coordinates" SET DATA TYPE DOUBLE PRECISION[];

-- AlterTable
ALTER TABLE "Pickup" ALTER COLUMN "donatorCoords" SET DATA TYPE DOUBLE PRECISION[],
ALTER COLUMN "pickupCoords" SET DATA TYPE DOUBLE PRECISION[];

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "currentCoords" SET DATA TYPE DOUBLE PRECISION[];