import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportarProgresoMaterialDto {
  @ApiProperty({ example: 1, description: 'ID de la matrícula del alumno' })
  @IsNumber()
  idmatricula: number;

  @ApiProperty({ example: 45, description: 'ID del material de la lección' })
  @IsNumber()
  idmaterial: number;

  @ApiProperty({
    example: 120,
    description: 'Segundo actual en el que se encuentra el reproductor',
  })
  @IsNumber()
  segundoActual: number;

  @ApiProperty({
    example: 600,
    description: 'Duración total del material (video) en segundos',
  })
  @IsNumber()
  duracionSegundos: number;

  @ApiProperty({
    example: 'timeupdate',
    description: 'Evento disparado por el reproductor',
    enum: ['play', 'pause', 'timeupdate', 'seeked', 'ended', 'loaded'],
    required: false,
  })
  @IsOptional()
  @IsIn(['play', 'pause', 'timeupdate', 'seeked', 'ended', 'loaded'])
  evento?: 'play' | 'pause' | 'timeupdate' | 'seeked' | 'ended' | 'loaded';
}
