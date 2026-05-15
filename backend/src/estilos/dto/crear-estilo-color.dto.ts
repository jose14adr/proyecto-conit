import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearEstiloColorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'hex debe tener formato HEX. Ejemplo: #3B82F6',
  })
  hex: string;

  @IsOptional()
  @IsNumber()
  hue?: number | null;

  @IsOptional()
  @IsNumber()
  saturation?: number | null;

  @IsOptional()
  @IsNumber()
  value?: number | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsInt()
  orden?: number;
}