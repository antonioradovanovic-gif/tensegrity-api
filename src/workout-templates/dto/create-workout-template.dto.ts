import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkoutTemplateExerciseDto {
  @ApiProperty({ example: 'clxyz456' })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({ example: 0, minimum: 0 })
  @IsInt()
  @Min(0)
  order: number;
}

export class CreateWorkoutTemplateDto {
  @ApiProperty({ example: 'Push Day A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Trening za prsa, ramena i tricepse' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: () => [WorkoutTemplateExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutTemplateExerciseDto)
  exercises: WorkoutTemplateExerciseDto[];
}
