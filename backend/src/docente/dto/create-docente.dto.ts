import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  IsBoolean,
} from 'class-validator';

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

  @IsString({ message: 'El teléfono debe ser un texto válido' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  telefono: string;

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

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsOptional() 
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial',
  })
  contrasenia?: string;

  @IsString({ message: 'El título debe ser un texto' })
  @IsOptional()
  titulo?: string;

  @IsString({ message: 'La experiencia debe ser un texto' })
  @IsOptional()
  experiencia?: string;

  @IsString({ message: 'La bio debe ser un texto' })
  @IsOptional()
  bio?: string;

  @IsString({
    message: 'El nombre de contacto de emergencia debe ser un texto',
  })
  @IsOptional()
  contacto_emergencia_nombre?: string;

  @IsString({
    message: 'El teléfono de contacto de emergencia debe ser un texto',
  })
  @IsOptional()
  contacto_emergencia_telefono?: string;
}
