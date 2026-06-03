-- AlterTable
ALTER TABLE "User" ADD COLUMN     "liabilityAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medicalHistory" JSONB;
