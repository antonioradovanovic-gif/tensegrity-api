-- AlterTable
ALTER TABLE "User" ADD COLUMN     "maxMonthlyStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weeklyGoal" INTEGER;
