import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';

@Injectable()
export class WorkoutTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWorkoutTemplateDto) {
    const exerciseIds = dto.exercises.map((e) => e.exerciseId);
    const existing = await this.prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
    });

    if (existing.length !== exerciseIds.length) {
      throw new BadRequestException('Some exercises do not exist');
    }

    return this.prisma.workoutTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        exercises: {
          create: dto.exercises.map((e) => ({
            order: e.order,
            exercise: { connect: { id: e.exerciseId } },
          })),
        },
      },
      include: {
        exercises: { include: { exercise: true } },
      },
    });
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [templates, total] = await this.prisma.$transaction([
      this.prisma.workoutTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.workoutTemplate.count({ where }),
    ]);

    return { data: templates, total, page, limit };
  }

  async findOne(id: string) {
    const template = await this.prisma.workoutTemplate.findUnique({
      where: { id },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
      },
    });

    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: UpdateWorkoutTemplateDto) {
    const template = await this.prisma.workoutTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    if (dto.exercises) {
      const exerciseIds = dto.exercises.map((e) => e.exerciseId);
      const existing = await this.prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
      });
      if (existing.length !== exerciseIds.length) {
        throw new BadRequestException('Some exercises do not exist');
      }

      await this.prisma.workoutTemplateExercise.deleteMany({ where: { templateId: id } });
    }

    return this.prisma.workoutTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        ...(dto.exercises
          ? {
              exercises: {
                create: dto.exercises.map((e) => ({
                  order: e.order,
                  exercise: { connect: { id: e.exerciseId } },
                })),
              },
            }
          : {}),
      },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
      },
    });
  }

  async remove(id: string) {
    const template = await this.prisma.workoutTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.workoutTemplate.delete({ where: { id } });
  }
}
