import { IsEnum } from 'class-validator';
import { ClientType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SetClientTypeDto {
  @ApiProperty({ enum: ClientType })
  @IsEnum(ClientType)
  clientType: ClientType;
}
