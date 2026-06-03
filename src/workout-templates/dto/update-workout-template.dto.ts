import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateTemplateExerciseDto {
  @IsString()
  exerciseId: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class UpdateWorkoutTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateTemplateExerciseDto)
  exercises?: UpdateTemplateExerciseDto[];
}
