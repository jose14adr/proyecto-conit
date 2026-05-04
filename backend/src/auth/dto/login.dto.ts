import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'alumno@ejemplo.com',
    description: 'Correo electrónico registrado del usuario',
  })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;
  @ApiProperty({
    example: 'MiPasswordSeguro123',
    description: 'Contraseña en texto plano',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasenia: string;
  @ApiProperty({
    example: '03AFcWeA4...',
    description: 'Token generado por Google reCaptcha v3 en el frontend',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El reCaptcha es obligatorio' })
  recaptchaToken: string;
}
