import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApproveUserDto } from './dto/approve-user.dto';
import { CreateClientNoteDto } from './dto/client-note.dto';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { SetClientTypeDto } from './dto/set-client-type.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ======================================================
  // REGISTRATION REQUESTS
  // ======================================================

  getPendingUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          status: true,
          clientType: true,
        },
      }),
      this.prisma.user.count({ where: { status: 'PENDING' } }),
    ]);
  }

  async approveUser(id: string, dto: ApproveUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'APPROVED',
        clientType: dto.clientType ?? undefined,
      },
    });
  }

  async rejectUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  // ======================================================
  // CLIENT LIST
  // ======================================================

  async getClients(
    page = 1,
    limit = 20,
    search?: string,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { role: 'CLIENT', status: 'APPROVED' };

    if (search) {
      const parts = search.trim().split(/\s+/);
      if (parts.length >= 2) {
        // "ana p" → ime sadrži "ana" I prezime počinje s "p"
        where.AND = [
          { firstName: { contains: parts[0], mode: 'insensitive' } },
          { lastName: { startsWith: parts[1], mode: 'insensitive' } },
        ];
      } else {
        // jedna riječ → traži u imenu ili prezimenu
        where.OR = [
          { firstName: { contains: parts[0], mode: 'insensitive' } },
          { lastName: { contains: parts[0], mode: 'insensitive' } },
        ];
      }
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [clients, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastName: 'asc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          clientType: true,
          isActive: true,
          isInRehabilitation: true,
          onboardingCompleted: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: clients, total, page, limit };
  }

  // ======================================================
  // CLIENT DETAILS
  // ======================================================

  async getClientStats(id: string) {
    const client = await this.prisma.user.findUnique({
      where: { id },
      select: { weeklyGoal: true, monthlyStreak: true, maxMonthlyStreak: true },
    });
    if (!client) throw new NotFoundException('Client not found');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const totalCompleted = await this.prisma.workoutCompletion.count({
      where: { completedById: id, completed: true },
    });

    const completedThisMonth = await this.prisma.workoutCompletion.count({
      where: { completedById: id, completed: true, completedAt: { gte: startOfMonth, lte: endOfMonth } },
    });

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

    return {
      weeklyGoal: client.weeklyGoal,
      monthlyGoal: client.weeklyGoal ? client.weeklyGoal * 4 : null,
      completedThisMonth,
      totalCompleted,
      currentStreak: client.monthlyStreak,
      maxStreak: client.maxMonthlyStreak,
      workoutMedals: WORKOUT_MEDALS.filter((m) => totalCompleted >= m.required),
      streakMedals: STREAK_MEDALS.filter((m) => client.maxMonthlyStreak >= m.required),
    };
  }

  async getClientAnamneza(id: string) {
    const client = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, medicalHistory: true, onboardingCompleted: true },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async getClientDetails(id: string) {
    const client = await this.prisma.user.findUnique({
      where: { id },
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
        isActive: true,
        isInRehabilitation: true,
        mainGoal: true,
        goalReason: true,
        successCriteria: true,
        liabilityAccepted: true,
        onboardingCompleted: true,
        medicalHistory: true,
        createdAt: true,
        documents: true,
        notes: { orderBy: { date: 'desc' } },
      },
    });

    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async getClientWorkouts(
    id: string,
    page = 1,
    limit = 20,
    dateFrom?: string,
    dateTo?: string,
    category?: string,
    subcategory?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { clientId: id };

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) where.scheduledDate.lte = new Date(dateTo);
    }

    if (category || subcategory) {
      where.exercises = {
        some: {
          exercise: {
            ...(category ? { category } : {}),
            ...(subcategory ? { subcategory } : {}),
          },
        },
      };
    }

    const [workouts, total] = await this.prisma.$transaction([
      this.prisma.workout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          exercises: { include: { exercise: true } },
          completion: true,
        },
      }),
      this.prisma.workout.count({ where }),
    ]);

    return { data: workouts, total, page, limit };
  }

  // ======================================================
  // CLIENT MANAGEMENT
  // ======================================================

  async setActive(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Client not found');

    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  async setClientType(id: string, dto: SetClientTypeDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Client not found');

    return this.prisma.user.update({
      where: { id },
      data: { clientType: dto.clientType },
    });
  }

  async toggleRehabilitation(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Client not found');

    return this.prisma.user.update({
      where: { id },
      data: { isInRehabilitation: !user.isInRehabilitation },
    });
  }

  // ======================================================
  // CLIENT NOTES
  // ======================================================

  async createNote(clientId: string, dto: CreateClientNoteDto) {
    const client = await this.prisma.user.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.clientNote.create({
      data: {
        clientId,
        content: dto.content,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async deleteNote(noteId: string) {
    const note = await this.prisma.clientNote.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.clientNote.delete({ where: { id: noteId } });
  }

  // ======================================================
  // PAYMENTS
  // ======================================================

  async getPayments(clientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const client = await this.prisma.user.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { clientId },
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.payment.count({ where: { clientId } }),
    ]);

    return { data: payments, total, page, limit };
  }

  async createPayment(clientId: string, dto: CreatePaymentDto) {
    const client = await this.prisma.user.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const existing = await this.prisma.payment.findFirst({
      where: { clientId, month: dto.month, year: dto.year },
    });
    if (existing) {
      throw new BadRequestException('Payment for this month/year already exists');
    }

    return this.prisma.payment.create({
      data: { clientId, ...dto },
    });
  }

  async updatePayment(paymentId: string, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: dto,
    });
  }

  async deletePayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.delete({ where: { id: paymentId } });
  }

  // ======================================================
  // CALENDAR
  // ======================================================

  async getBirthdayCalendar() {
    const clients = await this.prisma.user.findMany({
      where: {
        role: 'CLIENT',
        status: 'APPROVED',
        isActive: true,
        dateOfBirth: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
      },
      orderBy: { dateOfBirth: 'asc' },
    });

    return clients.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      dateOfBirth: c.dateOfBirth,
      month: c.dateOfBirth!.getMonth() + 1,
      day: c.dateOfBirth!.getDate(),
    }));
  }

  async getCalendarNotes(dateFrom?: string, dateTo?: string) {
    const where: any = {
      client: { isActive: true },
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    return this.prisma.clientNote.findMany({
      where,
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
