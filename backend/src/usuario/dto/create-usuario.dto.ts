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
  @ApiProperty({ example: 'usuario@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  idempresa: number;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  contrasenia: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  rol: string;
}