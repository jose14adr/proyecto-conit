import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocenteDto {
  @ApiProperty({ example: 'Carlos', description: 'Nombre del docente' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({ example: 'García', description: 'Apellido del docente' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @ApiProperty({ example: 'DNI', description: 'Tipo de documento' })
  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  tipoDocumento: string;

  @ApiProperty({
    example: '955666777',
    description: 'Número de teléfono de contacto',
  })
  @IsString({ message: 'El teléfono debe ser un texto válido' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  telefono: string;

  @ApiProperty({
    example: 'Av. Universitaria 450',
    description: 'Dirección de domicilio',
  })
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @ApiProperty({
    example: 'carlos.docente@aula.com',
    description: 'Correo electrónico institucional o personal',
  })
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de documento de identidad',
  })
  @IsString({ message: 'El número de documento debe ser un texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numDocumento: string;

  @ApiProperty({
    example: true,
    description: 'Indica si se creará automáticamente un usuario de acceso',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  crearUsuario?: boolean;

  @ApiProperty({
    example: 'Docente2026!',
    description:
      'Contraseña (Requerida si crearUsuario es true). Debe tener 8 caracteres, mayúscula, número y símbolo.',
    required: false,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsOptional()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial',
  })
  contrasenia?: string;

  @ApiProperty({
    example: 'Magíster en Ciencias de la Computación',
    required: false,
  })
  @IsString({ message: 'El título debe ser un texto' })
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    example: '15 años como docente universitario y consultor SAP',
    required: false,
  })
  @IsString({ message: 'La experiencia debe ser un texto' })
  @IsOptional()
  experiencia?: string;

  @ApiProperty({
    example: 'Especialista en desarrollo backend con Node.js y Python.',
    required: false,
  })
  @IsString({ message: 'La bio debe ser un texto' })
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'María Sánchez',
    description: 'Nombre de contacto para emergencias',
    required: false,
  })
  @IsString({
    message: 'El nombre de contacto de emergencia debe ser un texto',
  })
  @IsOptional()
  contacto_emergencia_nombre?: string;

  @ApiProperty({
    example: '911222333',
    description: 'Teléfono de emergencia',
    required: false,
  })
  @IsString({
    message: 'El teléfono de contacto de emergencia debe ser un texto',
  })
  @IsOptional()
  contacto_emergencia_telefono?: string;
}
