import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CertificadoService } from './certificado.service';

@Controller('certificado')
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) {}

  @Get()
  findAll() {
    return this.certificadoService.findAll();
  }

  @Get('alumno/:idalumno')
  findByAlumno(@Param('idalumno', ParseIntPipe) idalumno: number) {
    return this.certificadoService.findByAlumno(idalumno);
  }
}