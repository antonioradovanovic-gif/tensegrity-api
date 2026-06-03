import {
  IsInt,
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 6, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026, minimum: 2000 })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Mjesečna pretplata' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({ example: 7, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @ApiPropertyOptional({ example: 2026, minimum: 2000 })
  @IsInt()
  @Min(2000)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: 160.0 })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'Tromjesečna pretplata' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
