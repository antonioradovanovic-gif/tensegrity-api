import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Prisma } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteWorkoutDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  completed: boolean;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  feeling?: number;

  @ApiPropertyOptional({ example: 'Odličan trening, malo umoran' })
  @IsOptional()
  @IsString()
  feedbackNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  rehabilitationAnswers?: Prisma.InputJsonValue;
}
