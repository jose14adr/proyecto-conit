import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { ExamenService } from './examen.service';

@Controller('examen')
export class ExamenController {
  constructor(private readonly examenService: ExamenService) {}

  @Get('curso/:grupoId')
  getByCurso(@Param('grupoId', ParseIntPipe) grupoId: number) {
    return this.examenService.getByCurso(grupoId);
  }

  @Post(':id/iniciar')
  iniciar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { idAlumno: number },
  ) {
    return this.examenService.iniciar(id, body.idAlumno);
  }

  @Post(':examenId/responder')
  async responder(
    @Param('examenId', ParseIntPipe) examenId: number,
    @Body() body: { respuestas: Record<string, number> },
  ) {
    console.log('Examen ID recibido:', examenId);
    console.log('Respuestas recibidas:', body.respuestas);
    return await this.examenService.responder(examenId, body.respuestas);
  }
}
