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

export class CreateAdministradorDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del administrador' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del administrador' })
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
    example: '12345678',
    description: 'Número de documento de identidad',
  })
  @IsString()
  @IsNotEmpty()
  numdocumento: string;

  @ApiProperty({
    example: '987654321',
    description: 'Número de teléfono de contacto',
  })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({
    example: 'Av. Las Gardenias 123',
    description: 'Dirección domiciliaria',
    required: false,
  })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({
    example: 'admin@aula.com',
    description: 'Correo electrónico único',
  })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({
    example: true,
    description:
      'Indica si se debe crear una cuenta de usuario para este admin',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  crearUsuario?: boolean;

  @ApiProperty({
    example: 'Admin123!',
    description:
      'Contraseña (Requerida si crearUsuario es true). Debe tener 8 caracteres, mayúscula, número y símbolo.',
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
