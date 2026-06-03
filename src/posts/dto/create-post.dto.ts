import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Svaki trening je korak bliže cilju!' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
