import { Controller, Get, UseGuards } from '@nestjs/common';
import { PensionService } from './pension.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Pensiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pension')
export class PensionController {
  constructor(private readonly pensionService: PensionService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas las pensiones',
    description:
      'Retorna el registro completo de pensiones, cuotas y estados de pago de los alumnos matriculados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pensiones obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  findAll() {
    return this.pensionService.findAll();
  }
}
