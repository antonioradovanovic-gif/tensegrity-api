import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardingDto {
  @ApiPropertyOptional({ example: 'Izgubiti tjelesnu težinu' })
  @IsString()
  @IsOptional()
  mainGoal?: string;

  @ApiPropertyOptional({ example: 'Zdravlje i samopouzdanje' })
  @IsString()
  @IsOptional()
  goalReason?: string;

  @ApiPropertyOptional({ example: 'Smanjiti težinu za 10kg' })
  @IsString()
  @IsOptional()
  successCriteria?: string;
}
