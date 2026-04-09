import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateAlumnoDto {
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

  // 👇 CAMBIO AQUÍ: Ahora es String en lugar de Number 👇
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsOptional()
  lugar_residencia?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  provincia?: string;

  @IsString()
  @IsOptional()
  distrito?: string;

  @IsString()
  @IsOptional()
  estado_civil?: string;

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
