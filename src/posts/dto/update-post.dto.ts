import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({ example: 'Ažurirana poruka!' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
