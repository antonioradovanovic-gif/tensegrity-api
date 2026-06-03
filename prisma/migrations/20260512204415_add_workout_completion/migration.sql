-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('PLANNED', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- AlterTable
ALTER TABLE "UserDocument" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "status" "WorkoutStatus" NOT NULL DEFAULT 'PLANNED';

-- CreateTable
CREATE TABLE "WorkoutCompletion" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "completedById" TEXT,
    "completed" BOOLEAN NOT NULL,
    "feeling" INTEGER,
    "feedbackNote" TEXT,
    "rehabilitationAnswers" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutCompletion_workoutId_key" ON "WorkoutCompletion"("workoutId");

-- CreateIndex
CREATE INDEX "Workout_clientId_idx" ON "Workout"("clientId");

-- CreateIndex
CREATE INDEX "Workout_scheduledDate_idx" ON "Workout"("scheduledDate");

-- CreateIndex
CREATE INDEX "Workout_status_idx" ON "Workout"("status");

-- AddForeignKey
ALTER TABLE "WorkoutCompletion" ADD CONSTRAINT "WorkoutCompletion_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutCompletion" ADD CONSTRAINT "WorkoutCompletion_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
