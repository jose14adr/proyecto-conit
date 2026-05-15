import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class ActualizarEstiloConfiguracionDto {
  @IsOptional()
  @IsInt()
  colorPrincipalId?: number | null;

  @IsOptional()
  @IsInt()
  colorSecundarioId?: number | null;

  @IsOptional()
  @IsInt()
  colorSidenavId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'colorPrincipalCustom debe tener formato HEX. Ejemplo: #3B82F6',
  })
  colorPrincipalCustom?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'colorSecundarioCustom debe tener formato HEX. Ejemplo: #0EA5E9',
  })
  colorSecundarioCustom?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'colorSidenavCustom debe tener formato HEX. Ejemplo: #1E293B',
  })
  colorSidenavCustom?: string | null;

  @IsOptional()
  @IsBoolean()
  botonPrimarioUsaSidenav?: boolean;

  @IsOptional()
  @IsBoolean()
  botonSecundarioUsaSidenav?: boolean;

  @IsOptional()
  @IsInt()
  botonPrimarioColorId?: number | null;

  @IsOptional()
  @IsInt()
  botonSecundarioColorId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'botonPrimarioCustom debe tener formato HEX. Ejemplo: #3B82F6',
  })
  botonPrimarioCustom?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'botonSecundarioCustom debe tener formato HEX. Ejemplo: #0EA5E9',
  })
  botonSecundarioCustom?: string | null;

  @IsOptional()
  @IsIn(['OSCURO', 'TRANSPARENTE', 'BLANCO'])
  tipoSidenav?: 'OSCURO' | 'TRANSPARENTE' | 'BLANCO';

  @IsOptional()
  @IsBoolean()
  sidenavMini?: boolean;

  @IsOptional()
  @IsBoolean()
  modoOscuro?: boolean;
}