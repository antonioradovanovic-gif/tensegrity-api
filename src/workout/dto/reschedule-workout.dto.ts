import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleWorkoutDto {
  @ApiProperty({ example: '2026-06-15T10:00:00.000Z' })
  @IsDateString()
  scheduledDate: string;
}
