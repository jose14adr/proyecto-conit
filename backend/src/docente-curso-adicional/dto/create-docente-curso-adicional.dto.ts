import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateDocenteCursoAdicionalDto {
  @ApiProperty({
    example: 1,
    description: 'ID del docente al que pertenece el curso',
  })
  @IsNumber()
  @IsNotEmpty()
  iddocente?: number;

  @ApiProperty({
    example: 'Especialización en AWS Cloud',
    description: 'Nombre del curso o certificación',
  })
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiProperty({ example: 'Udemy / Amazon Web Services', required: false })
  @IsString()
  @IsOptional()
  institucion?: string;

  @ApiProperty({
    example: '2023-01-15',
    description: 'Fecha de inicio del curso',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_inicio?: Date;

  @ApiProperty({
    example: '2023-03-20',
    description: 'Fecha de finalización del curso',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_fin?: Date;

  @ApiProperty({
    example: 'https://storage.com/certificados/cert-123.pdf',
    description: 'URL del certificado o comprobante',
    required: false,
  })
  @IsString()
  @IsOptional()
  archivo_url?: string;
}
