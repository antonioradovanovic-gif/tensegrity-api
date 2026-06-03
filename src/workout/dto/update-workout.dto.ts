import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { WorkoutType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkoutDto {
  @ApiPropertyOptional({ example: 'Trening snage B' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '2026-06-12T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ enum: WorkoutType })
  @IsOptional()
  @IsEnum(WorkoutType)
  type?: WorkoutType;

  @ApiPropertyOptional({ type: () => [UpdateWorkoutExerciseDto] })
  @IsOptional()
  @IsArray()
  exercises?: UpdateWorkoutExerciseDto[];
}

export class UpdateWorkoutExerciseDto {
  @ApiPropertyOptional({ example: 'clxyz789' })
  @IsString()
  workoutExerciseId: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  sets?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  reps?: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  rpe?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  vas?: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber()
  restSeconds?: number;

  @ApiPropertyOptional({ example: 'Sporo spuštanje' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}
