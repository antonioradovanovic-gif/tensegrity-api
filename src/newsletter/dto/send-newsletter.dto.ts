import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NewsletterRecipientType {
  ALL = 'ALL',
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  SELECTED = 'SELECTED',
}

export class SendNewsletterDto {
  @ApiProperty({ example: 'Novosti za lipanj' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Dragi klijenti, ovo su novosti za ovaj mjesec...' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NewsletterRecipientType })
  @IsEnum(NewsletterRecipientType)
  recipientType: NewsletterRecipientType;

  @ApiPropertyOptional({ example: ['clxyz123', 'clxyz456'], description: 'Obavezno samo ako je recipientType SELECTED' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clientIds?: string[];
}
