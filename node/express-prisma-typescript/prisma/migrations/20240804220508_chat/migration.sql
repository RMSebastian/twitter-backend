/*
  Warnings:

  - The values [Like,Retweet] on the enum `ReactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `authorId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReactionType_new" AS ENUM ('LIKE', 'RETWEET');
ALTER TABLE "Reaction" ALTER COLUMN "type" TYPE "ReactionType_new" USING ("type"::text::"ReactionType_new");
ALTER TYPE "ReactionType" RENAME TO "ReactionType_old";
ALTER TYPE "ReactionType_new" RENAME TO "ReactionType";
DROP TYPE "ReactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "authorId",
ADD COLUMN     "senderId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
