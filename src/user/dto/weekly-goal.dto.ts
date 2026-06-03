import { IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeeklyGoalDto {
  @ApiProperty({ example: 3, description: '2, 3, 4 ili 5 treninga tjedno' })
  @IsInt()
  @IsIn([2, 3, 4, 5])
  weeklyGoal: number;
}
