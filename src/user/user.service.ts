import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { AnamnesaDto } from './dto/anamneza.dto';
import { WeeklyGoalDto } from './dto/weekly-goal.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as argon2 from '@node-rs/argon2';

const WORKOUT_MEDALS = [
  { key: 'BRONZE_1', label: 'Bronca I', required: 10 },
  { key: 'BRONZE_2', label: 'Bronca II', required: 25 },
  { key: 'SILVER_1', label: 'Srebro I', required: 50 },
  { key: 'SILVER_2', label: 'Srebro II', required: 100 },
  { key: 'GOLD_1', label: 'Zlato I', required: 250 },
  { key: 'GOLD_2', label: 'Zlato II', required: 500 },
  { key: 'PLATINUM', label: 'Platina', required: 750 },
  { key: 'DIAMOND', label: 'Dijamant', required: 1000 },
];

const STREAK_MEDALS = [
  { key: 'STREAK_BRONZE', label: 'Kontinuitet Bronca', required: 2 },
  { key: 'STREAK_SILVER', label: 'Kontinuitet Srebro', required: 3 },
  { key: 'STREAK_GOLD', label: 'Kontinuitet Zlato', required: 4 },
  { key: 'STREAK_DIAMOND', label: 'Kontinuitet Dijamant', required: 5 },
];

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        occupation: true,
        clientType: true,
        role: true,
        status: true,
        isActive: true,
        isInRehabilitation: true,
        onboardingCompleted: true,
        mainGoal: true,
        goalReason: true,
        successCriteria: true,
        liabilityAccepted: true,
        weeklyGoal: true,
        monthlyStreak: true,
        maxMonthlyStreak: true,
      },
    });
  }

  async setWeeklyGoal(userId: string, dto: WeeklyGoalDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { weeklyGoal: dto.weeklyGoal },
      select: { id: true, weeklyGoal: true },
    });
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyGoal: true, monthlyStreak: true, maxMonthlyStreak: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Ukupno završenih treninga
    const totalCompleted = await this.prisma.workoutCompletion.count({
      where: { completedById: userId, completed: true },
    });

    // Završeni ovaj mjesec
    const completedThisMonth = await this.prisma.workoutCompletion.count({
      where: {
        completedById: userId,
        completed: true,
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const monthlyGoal = user.weeklyGoal ? user.weeklyGoal * 4 : null;

    // Streak izračun - provjeri prošle mjesece
    let currentStreak = user.monthlyStreak;
    let maxStreak = user.maxMonthlyStreak;

    if (user.weeklyGoal) {
      currentStreak = await this.calculateStreak(userId, user.weeklyGoal);
      maxStreak = Math.max(currentStreak, user.maxMonthlyStreak);

      // Spremi ažurirani streak
      await this.prisma.user.update({
        where: { id: userId },
        data: { monthlyStreak: currentStreak, maxMonthlyStreak: maxStreak },
      });
    }

    const earnedWorkoutMedals = WORKOUT_MEDALS.filter((m) => totalCompleted >= m.required);
    const earnedStreakMedals = STREAK_MEDALS.filter((m) => maxStreak >= m.required);

    return {
      weeklyGoal: user.weeklyGoal,
      monthlyGoal,
      completedThisMonth,
      totalCompleted,
      currentStreak,
      maxStreak,
      workoutMedals: earnedWorkoutMedals,
      streakMedals: earnedStreakMedals,
    };
  }

  private async calculateStreak(userId: string, weeklyGoal: number): Promise<number> {
    const completions = await this.prisma.workoutCompletion.findMany({
      where: { completedById: userId, completed: true, completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    // Grupiraj po godina-mjesec
    const byMonth: Record<string, number> = {};
    for (const c of completions) {
      if (!c.completedAt) continue;
      const key = `${c.completedAt.getFullYear()}-${c.completedAt.getMonth()}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    }

    const monthlyGoal = weeklyGoal * 4;
    const now = new Date();
    let streak = 0;

    // Počni od prošlog mjeseca (trenutni nije završen)
    let year = now.getFullYear();
    let month = now.getMonth() - 1;

    while (true) {
      if (month < 0) { month = 11; year--; }
      const key = `${year}-${month}`;
      if ((byMonth[key] || 0) >= monthlyGoal) {
        streak++;
        month--;
      } else {
        break;
      }
    }

    return streak;
  }

  async submitAnamneza(userId: string, dto: AnamnesaDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { medicalHistory: { ...dto } },
      select: { id: true, medicalHistory: true },
    });
  }

  async getAnamneza(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, medicalHistory: true, onboardingCompleted: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async finishOnboarding(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { liabilityAccepted: true, onboardingCompleted: true },
      select: { id: true, liabilityAccepted: true, onboardingCompleted: true },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        occupation: true,
        mainGoal: true,
        goalReason: true,
        successCriteria: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.password, dto.currentPassword);
    if (!valid) throw new UnauthorizedException('Pogrešna trenutna lozinka');

    const hash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    return { message: 'Lozinka uspješno promijenjena' };
  }

  async getCommunityDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [workoutsThisMonth, workoutsThisYear] = await Promise.all([
      this.prisma.workoutCompletion.count({
        where: { completed: true, completedAt: { gte: startOfMonth } },
      }),
      this.prisma.workoutCompletion.count({
        where: { completed: true, completedAt: { gte: startOfYear } },
      }),
    ]);

    // Pie chart - klijenti koji su ispunili cilj prošli mjesec
    const clientsWithGoal = await this.prisma.user.findMany({
      where: { role: 'CLIENT', status: 'APPROVED', weeklyGoal: { not: null } },
      select: { id: true, weeklyGoal: true },
    });

    const lastMonthCounts = await this.prisma.workoutCompletion.groupBy({
      by: ['completedById'],
      where: { completed: true, completedAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      _count: { id: true },
    });

    const countMap = new Map(lastMonthCounts.map((e) => [e.completedById, e._count.id]));

    let metGoal = 0;
    let didNotMeetGoal = 0;
    for (const client of clientsWithGoal) {
      const done = countMap.get(client.id) ?? 0;
      if (done >= client.weeklyGoal! * 4) metGoal++;
      else didNotMeetGoal++;
    }

    // Bar chart - distribucija treninga po članu ovaj mjesec
    const thisMonthCounts = await this.prisma.workoutCompletion.groupBy({
      by: ['completedById'],
      where: { completed: true, completedAt: { gte: startOfMonth } },
      _count: { id: true },
    });

    const distribution: Record<number, number> = {};
    for (const entry of thisMonthCounts) {
      const bucket = Math.min(entry._count.id, 7);
      distribution[bucket] = (distribution[bucket] || 0) + 1;
    }
    const workoutDistribution = Array.from({ length: 8 }, (_, i) => ({
      workouts: i,
      members: distribution[i] ?? 0,
    }));

    // Linearni graf - treninzi po tjednu zadnjih 8 tjedana
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
    const recentCompletions = await this.prisma.workoutCompletion.findMany({
      where: { completed: true, completedAt: { gte: eightWeeksAgo } },
      select: { completedAt: true },
    });

    const byWeek: Record<string, number> = {};
    for (const c of recentCompletions) {
      if (!c.completedAt) continue;
      const weekKey = this.getWeekStart(c.completedAt);
      byWeek[weekKey] = (byWeek[weekKey] || 0) + 1;
    }
    const weeklyTrend = Object.entries(byWeek)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return {
      workoutsThisMonth,
      workoutsThisYear,
      goalPieChart: { metGoal, didNotMeetGoal, total: metGoal + didNotMeetGoal },
      workoutDistribution,
      weeklyTrend,
    };
  }

  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }

  async completeOnboarding(userId: string, dto: OnboardingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        mainGoal: dto.mainGoal,
        goalReason: dto.goalReason,
        successCriteria: dto.successCriteria,
      },
      select: { id: true, mainGoal: true, goalReason: true, successCriteria: true },
    });
  }
}
