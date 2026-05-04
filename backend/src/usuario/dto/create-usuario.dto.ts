import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'usuario@gmail.com',
    description: 'Correo electrónico único para el acceso',
  })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la empresa a la que pertenece el usuario',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  idempresa: number;

  @ApiProperty({
    example: 'Password123!',
    minLength: 8,
    description: 'Contraseña de acceso (mínimo 8 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  contrasenia: string;

  @ApiProperty({
    example: 'admin',
    enum: ['admin', 'docente', 'alumno'],
    description: 'Rol asignado dentro del sistema',
  })
  @IsString()
  @IsNotEmpty()
  rol: string;
}
