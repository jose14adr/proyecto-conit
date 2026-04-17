import {
  Controller,
  Post,
  Param,
  Body,
  Get,
} from '@nestjs/common';
import { ExamenService } from './examen.service';

@Controller('examen')
export class ExamenController {
  constructor(private readonly examenService: ExamenService) {}

  @Get('curso/:grupoId')
  getByCurso(@Param('grupoId') grupoId: number) {
    return this.examenService.getByCurso(grupoId); // Asegúrate de que este método devuelva preguntas
  }

  @Post(':examenId/responder')
  async responder(
    @Param('examenId') examenId: number,
    @Body() body: { respuestas: Record<string, number> },
  ) {
    console.log('Examen ID recibido:', examenId); // Verifica que el examenId sea correcto
    console.log('Respuestas recibidas:', body.respuestas); // Verifica que las respuestas sean correctas
    return await this.examenService.responder(examenId, body.respuestas);
  }
}
