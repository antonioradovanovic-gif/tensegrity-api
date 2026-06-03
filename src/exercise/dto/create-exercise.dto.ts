import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ExerciseCategory } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ enum: ExerciseCategory })
  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;

  @ApiPropertyOptional({ example: 'Bench Press varijacije' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({ example: 'Bench Press' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Osnovna vježba za prsa' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=...' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;
}
