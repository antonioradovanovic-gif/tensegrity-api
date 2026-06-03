import { IsEnum, IsOptional } from 'class-validator';
import { ClientType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveUserDto {
  @ApiPropertyOptional({ enum: ClientType })
  @IsEnum(ClientType)
  @IsOptional()
  clientType?: ClientType;
}
