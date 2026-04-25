import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ExamenService } from './examen.service';

@Controller('examen')
export class ExamenController {
  constructor(private readonly examenService: ExamenService) {}

  // 🔹 Obtener exámenes por curso
  @Get('curso/:grupoId')
  getByCurso(@Param('grupoId') grupoId: number) {
    return this.examenService.getByCurso(grupoId);
  }

  // 🔥 RESPONDER (USANDO INTENTO)
  @Post('responder')
  async responder(
    @Body() body: {
      intentoId: number,
      respuestas: Record<string, number>;
    }
  ) {
    return await this.examenService.responder(
      body.intentoId,
      body.respuestas
    );
  }

  // 🔥 INICIAR EXAMEN
  @Post(':id/iniciar')
  iniciar(
    @Param('id') id: number,
    @Body() body: { idAlumno: number }
  ) {
    return this.examenService.iniciar(id, body.idAlumno);
  }

  @Get('intentos/:idAlumno')
  getIntentos(@Param('idAlumno') idAlumno: number) {
    return this.examenService.getIntentosAlumno(idAlumno);
  }

  @Get('historial/:idAlumno')
async getHistorial(@Param('idAlumno') idAlumno: number) {
  return await this.examenService.getHistorial(idAlumno);
}
@Get(':id')
getExamen(@Param('id') id: number) {
  return this.examenService.getExamenCompleto(Number(id));
}

}