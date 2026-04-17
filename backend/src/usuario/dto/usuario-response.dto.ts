import { ApiProperty } from '@nestjs/swagger';

export class UsuarioResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  correo: string;

  @ApiProperty()
  idempresa: number;

  @ApiProperty()
  rol: string;

  @ApiProperty()
  estado: boolean;
}