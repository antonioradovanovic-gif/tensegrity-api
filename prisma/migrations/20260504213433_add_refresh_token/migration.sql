/*
  Warnings:

  - Added the required column `createdAt` to the `UserDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT;

-- AlterTable
ALTER TABLE "UserDocument" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;
