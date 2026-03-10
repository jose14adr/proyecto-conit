import { IsString, IsNotEmpty, IsNumber, IsEmail, IsBoolean, IsOptional, Matches, ValidateIf } from "class-validator";

export class CreateDocenteDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  tipoDocumento: string;

  @IsNumber({}, { message: 'El teléfono debe ser un número' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  telefono: number;

  @IsString({ message: 'La dirección debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString({ message: 'El número de documento debe ser un texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numDocumento: string;

  @IsBoolean()
  @IsOptional()
  crearUsuario?: boolean; 

  @ValidateIf(o => o.crearUsuario === true)
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial',
  })
  contrasenia?: string;
}