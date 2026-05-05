import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT enviado al correo electrónico (válido por 5 min)',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @ApiProperty({
    example: 'NuevoPassword123!',
    description:
      'Nueva contraseña. Debe contener mayúscula, minúscula, número y carácter especial.',
  })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(15, {
    message: 'La contraseña no puede tener más de 15 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
  })
  contrasenia: string;

  @ApiProperty({ 
    example: '@23x5Z', 
    description: 'Código de 6 dígitos enviado por correo' 
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código de seguridad debe tener 6 digitos' })
  codigoSeguridad: string;
}
