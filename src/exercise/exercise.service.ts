import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseCategory } from '@prisma/client';

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExerciseDto, userId: string) {
    return this.prisma.exercise.create({
      data: {
        ...dto,
        createdById: userId,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    search?: string;
  }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);

    const [exercises, total] = await this.prisma.$transaction([
      this.prisma.exercise.findMany({
        where: {
          ...(query.category && { category: query.category as ExerciseCategory }),
          ...(query.subcategory && { subcategory: query.subcategory }),
          ...(query.search && {
            name: { contains: query.search, mode: 'insensitive' },
          }),
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.exercise.count({
        where: {
          ...(query.category && { category: query.category as ExerciseCategory }),
          ...(query.subcategory && { subcategory: query.subcategory }),
          ...(query.search && {
            name: { contains: query.search, mode: 'insensitive' },
          }),
        },
      }),
    ]);

    return { data: exercises, total, page, limit };
  }

  async findOne(id: string) {
    return this.prisma.exercise.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateExerciseDto) {
    return this.prisma.exercise.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.exercise.delete({
      where: { id },
    });
  }
}
