import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, Occupation } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ivan' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Horvat' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '+385911234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: Occupation })
  @IsOptional()
  @IsEnum(Occupation)
  occupation?: Occupation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainGoal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  goalReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  successCriteria?: string;
}
