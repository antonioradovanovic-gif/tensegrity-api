import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateWorkoutDto } from './dto/create-workout.dto';
import {
  UpdateWorkoutDto,
  UpdateWorkoutExerciseDto,
} from './dto/update-workout.dto';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';
import { RescheduleWorkoutDto } from './dto/reschedule-workout.dto';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  // ======================================================
  // CREATE WORKOUT
  // ======================================================
  async create(dto: CreateWorkoutDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const client = await this.prisma.user.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client not found');

    if (client.status !== 'APPROVED') {
      throw new BadRequestException('Client must be approved before assigning workouts');
    }

    if (client.role !== 'CLIENT') {
      throw new BadRequestException('Selected user is not a client');
    }

    if (user.role === 'CLIENT' && dto.clientId !== userId) {
      throw new ForbiddenException('Clients can create workouts only for themselves');
    }

    const exerciseIds = dto.exercises.map((e) => e.exerciseId);
    const existingExercises = await this.prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
    });

    if (existingExercises.length !== exerciseIds.length) {
      throw new BadRequestException('Some exercises do not exist');
    }

    return this.prisma.workout.create({
      data: {
        title: dto.title,
        clientId: dto.clientId,
        assignedById: userId,
        type: dto.type,
        scheduledDate: new Date(dto.scheduledDate),
        wasInRehabilitation: client.isInRehabilitation,
        exercises: {
          create: dto.exercises.map((exercise, index) => ({
            order: index,
            exercise: { connect: { id: exercise.exerciseId } },
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            weight: exercise.weight,
            rpe: exercise.rpe,
            restSeconds: exercise.restSeconds,
            note: exercise.note,
          })),
        },
      },
      include: {
        exercises: { include: { exercise: true } },
      },
    });
  }

  // ======================================================
  // FIND ALL WORKOUTS
  // ======================================================
  async findAll(
    userId: string,
    role: string,
    page = 1,
    limit = 20,
    dateFrom?: string,
    dateTo?: string,
    category?: string,
    subcategory?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = role === 'ADMIN' ? {} : { clientId: userId };

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
          client: true,
          assignedBy: true,
        },
      }),
      this.prisma.workout.count({ where }),
    ]);

    return { data: workouts, total, page, limit };
  }

  // ======================================================
  // FIND ONE WORKOUT
  // ======================================================
  async findOne(id: string, userId: string, role: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: { include: { exercise: true } },
        client: true,
        assignedBy: true,
        completion: true,
      },
    });

    if (!workout) throw new NotFoundException('Workout not found');

    if (role !== 'ADMIN' && workout.clientId !== userId) {
      throw new ForbiddenException('You cannot access this workout');
    }

    return workout;
  }

  // ======================================================
  // UPDATE WORKOUT
  // ======================================================
  async update(id: string, dto: UpdateWorkoutDto, userId: string, role: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: { exercises: true },
    });

    if (!workout) throw new NotFoundException('Workout not found');

    if (role !== 'ADMIN' && workout.clientId !== userId) {
      throw new ForbiddenException('No access to this workout');
    }

    if (dto.exercises && dto.exercises.length > 0) {
      const validExercises = await this.prisma.workoutExercise.findMany({
        where: {
          id: { in: dto.exercises.map((e) => e.workoutExerciseId) },
          workoutId: id,
        },
      });

      if (validExercises.length !== dto.exercises.length) {
        throw new ForbiddenException('Some exercises do not belong to this workout');
      }
    }

    return this.prisma.workout.update({
      where: { id },
      data: {
        title: dto.title,
        type: dto.type,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        exercises: dto.exercises
          ? {
              update: dto.exercises.map((ex: UpdateWorkoutExerciseDto) => ({
                where: { id: ex.workoutExerciseId },
                data: {
                  sets: ex.sets,
                  reps: ex.reps,
                  weight: ex.weight,
                  duration: ex.duration,
                  rpe: ex.rpe,
                  vas: ex.vas,
                  restSeconds: ex.restSeconds,
                  note: ex.note,
                  order: ex.order,
                },
              })),
            }
          : undefined,
      },
      include: {
        exercises: { include: { exercise: true } },
        client: true,
        assignedBy: true,
      },
    });
  }

  // ======================================================
  // DELETE WORKOUT
  // ======================================================
  async remove(id: string, userId: string, role: string): Promise<void> {
    const workout = await this.prisma.workout.findUnique({ where: { id } });
    if (!workout) throw new NotFoundException('Workout not found');

    if (role !== 'ADMIN' && workout.clientId !== userId) {
      throw new ForbiddenException('No access to this workout');
    }

    await this.prisma.workoutCompletion.deleteMany({ where: { workoutId: id } });
    await this.prisma.workoutExercise.deleteMany({ where: { workoutId: id } });
    await this.prisma.workout.delete({ where: { id } });
  }

  // ======================================================
  // COMPLETE WORKOUT
  // ======================================================
  async complete(id: string, dto: CompleteWorkoutDto, userId: string, role: string) {
    const workout = await this.prisma.workout.findUnique({ where: { id } });
    if (!workout) throw new NotFoundException('Workout not found');

    if (role !== 'ADMIN' && workout.clientId !== userId) {
      throw new ForbiddenException('No access');
    }

    await this.prisma.workout.update({
      where: { id },
      data: { status: dto.completed ? 'COMPLETED' : 'SKIPPED' },
    });

    return this.prisma.workoutCompletion.create({
      data: {
        completed: dto.completed,
        feeling: dto.feeling,
        feedbackNote: dto.feedbackNote,
        rehabilitationAnswers: dto.rehabilitationAnswers,
        completedAt: new Date(),
        workout: { connect: { id } },
        completedBy: { connect: { id: userId } },
      },
    });
  }

  // ======================================================
  // RESCHEDULE WORKOUT
  // ======================================================
  async reschedule(id: string, dto: RescheduleWorkoutDto, userId: string, role: string) {
    const workout = await this.prisma.workout.findUnique({ where: { id } });
    if (!workout) throw new NotFoundException('Workout not found');

    if (role !== 'ADMIN' && workout.clientId !== userId) {
      throw new ForbiddenException('No access');
    }

    if (workout.status === 'COMPLETED' || workout.status === 'CANCELLED') {
      throw new BadRequestException('Cannot reschedule completed or cancelled workout');
    }

    return this.prisma.workout.update({
      where: { id },
      data: { scheduledDate: new Date(dto.scheduledDate), status: 'PLANNED' },
    });
  }

  // ======================================================
  // CANCEL WORKOUT
  // ======================================================
  async cancel(id: string, userId: string, role: string) {
    const workout = await this.prisma.workout.findUnique({ where: { id } });
    if (!workout) throw new NotFoundException('Workout not found');

    if (role !== 'ADMIN' && workout.clientId !== userId) {
      throw new ForbiddenException('No access');
    }

    if (workout.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed workout');
    }

    return this.prisma.workout.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  // ======================================================
  // DASHBOARD HELPERS
  // ======================================================
  async getUpcoming(userId: string) {
    return this.prisma.workout.findMany({
      where: {
        clientId: userId,
        status: 'PLANNED',
        scheduledDate: { gte: new Date() },
      },
      include: { exercises: { include: { exercise: true } } },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async getOverdue(userId: string) {
    return this.prisma.workout.findMany({
      where: {
        clientId: userId,
        status: 'PLANNED',
        scheduledDate: { lt: new Date() },
      },
      include: { exercises: { include: { exercise: true } } },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async getHistory(userId: string) {
    return this.prisma.workout.findMany({
      where: {
        clientId: userId,
        status: { in: ['COMPLETED', 'CANCELLED', 'SKIPPED'] },
      },
      include: {
        exercises: { include: { exercise: true } },
        completion: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }
}
