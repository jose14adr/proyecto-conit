import { ApiProperty } from '@nestjs/swagger';

export class UsuarioResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'usuario@gmail.com' })
  correo: string;

  @ApiProperty({ example: 1 })
  idempresa: number;

  @ApiProperty({ example: 'admin' })
  rol: string;

  @ApiProperty({
    example: true,
    description: 'Estado de activación del usuario',
  })
  estado: boolean;
}
