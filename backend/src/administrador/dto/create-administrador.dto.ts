import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateAdministradorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  tipodocumento: string;

  @IsString()
  @IsNotEmpty()
  numdocumento: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsBoolean()
  @IsOptional()
  crearUsuario?: boolean;

  @ValidateIf((o) => o.crearUsuario === true)
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial',
  })
  contrasenia?: string;
}