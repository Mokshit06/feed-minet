-- AlterTable
ALTER TABLE "chat_rooms" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
