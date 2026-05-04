import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlumnoDto {
  @ApiProperty({ example: 'Ana', description: 'Nombre del alumno' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'García', description: 'Apellido del alumno' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    example: 'DNI',
    description: 'Tipo de documento (DNI, CE, Pasaporte)',
  })
  @IsString()
  @IsNotEmpty()
  tipodocumento: string;

  @ApiProperty({
    example: '77665544',
    description: 'Número de documento de identidad',
  })
  @IsString()
  @IsNotEmpty()
  numdocumento: string;

  @ApiProperty({
    example: '912345678',
    description: 'Número de teléfono (String)',
  })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({
    example: 'Calle Los Álamos 456',
    description: 'Dirección exacta',
    required: false,
  })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({
    example: 'ana.garcia@estudiante.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({
    example: 'Cajamarca',
    description: 'Lugar de residencia actual',
    required: false,
  })
  @IsString()
  @IsOptional()
  lugar_residencia?: string;

  @ApiProperty({
    example: 'Cajamarca',
    description: 'Departamento de residencia',
    required: false,
  })
  @IsString()
  @IsOptional()
  departamento?: string;

  @ApiProperty({
    example: 'Cajamarca',
    description: 'Provincia de residencia',
    required: false,
  })
  @IsString()
  @IsOptional()
  provincia?: string;

  @ApiProperty({
    example: 'Cajamarca',
    description: 'Distrito de residencia',
    required: false,
  })
  @IsString()
  @IsOptional()
  distrito?: string;

  @ApiProperty({
    example: 'Soltero/a',
    description: 'Estado civil del alumno',
    required: false,
  })
  @IsString()
  @IsOptional()
  estado_civil?: string;

  @ApiProperty({
    example: true,
    description: '¿Crear usuario de acceso al sistema?',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  crearUsuario?: boolean;

  @ApiProperty({
    example: 'Alumno123!',
    description: 'Contraseña de acceso. Requerida si crearUsuario es true.',
    required: false,
  })
  @ValidateIf((o) => o.crearUsuario === true)
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial',
  })
  contrasenia?: string;
}
