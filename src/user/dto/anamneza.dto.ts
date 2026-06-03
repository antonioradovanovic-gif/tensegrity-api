import { IsOptional, IsInt, IsBoolean, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnamnesaDto {
  @ApiPropertyOptional({ example: 7, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  opceZdravstvenoStanje?: number;

  @ApiPropertyOptional({ example: 6, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  fizickaKondicija?: number;

  @ApiPropertyOptional({ example: 8, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  zivotnoZadovoljstvo?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  podLijecnickomSkrbi?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  podLijecnickomSkrbiRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  biouBolniciPosljednjih14Dana?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  biouBolniciRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  fizikalnaTerapija?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  fizikalnaTerapijaRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  zarazneBolesti?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  zarazneBolestiRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  srceKrvozilni?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  srceKrvozilniRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  pluca?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  plucaRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  metabolizam?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  metabolizamRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  rak?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  rakRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  krv?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  krvRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  jetra?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  jetraRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  bubreciGenitalni?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  bubreciGenitalniRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  probavniTrakt?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  probavniTraktRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  kostiZgloboviMisici?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  kostiZgloboviMisiciRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  zivcaniSustavMentalno?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  zivcaniSustavMentalnoRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  koza?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  kozaRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ostalo?: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  ostaloRazlog?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  pusim?: boolean;

  @ApiPropertyOptional({ example: 'povremeno', description: 'povremeno / redovito' })
  @IsOptional()
  @IsString()
  alkohol?: string;

  @ApiPropertyOptional({ example: 'Brufen' })
  @IsOptional()
  @IsString()
  lijekovi?: string;

  @ApiPropertyOptional({ example: 'Polen, penicilin' })
  @IsOptional()
  @IsString()
  alergije?: string;

  @ApiPropertyOptional({ example: 'Prijelom noge 2018.' })
  @IsOptional()
  @IsString()
  ozljede?: string;

  @ApiPropertyOptional({ example: 'Operacija koljena 2020.' })
  @IsOptional()
  @IsString()
  operacije?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  metalniImplantati?: boolean;

  @ApiPropertyOptional({ example: 'Titanijska pločica u kuku' })
  @IsOptional()
  @IsString()
  metalniImplantatiKoji?: string;
}
