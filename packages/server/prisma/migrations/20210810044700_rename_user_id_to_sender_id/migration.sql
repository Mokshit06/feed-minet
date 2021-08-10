/*
  Warnings:

  - You are about to drop the column `user_id` on the `messages` table. All the data in the column will be lost.
  - Added the required column `sender_id` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_user_id_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "user_id",
ADD COLUMN     "sender_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
