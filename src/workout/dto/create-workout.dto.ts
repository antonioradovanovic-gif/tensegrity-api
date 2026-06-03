import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { WorkoutType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkoutDto {
  @ApiProperty({ example: 'Trening snage A' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'clxyz123' })
  @IsString()
  clientId: string;

  @ApiProperty({ enum: WorkoutType })
  @IsEnum(WorkoutType)
  type: WorkoutType;

  @ApiProperty({ example: '2026-06-10T10:00:00.000Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ type: () => [CreateWorkoutExerciseDto] })
  @IsArray()
  exercises: CreateWorkoutExerciseDto[];
}

export class CreateWorkoutExerciseDto {
  @ApiProperty({ example: 'clxyz456' })
  @IsString()
  exerciseId: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  sets?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  reps?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  rpe?: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  restSeconds?: number;

  @ApiPropertyOptional({ example: 'Fokus na spuštanje' })
  @IsOptional()
  note?: string;
}
