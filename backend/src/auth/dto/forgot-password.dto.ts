import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

//DTO para solicitar el restablecimiento de contraseña
export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo electrónico del usuario que desea recuperar su acceso',
  })
  //Validación del correo electrónico
  @IsEmail({}, { message: 'El correo debe ser válido' })
  //Validación de que el campo no esté vacío
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;
}
