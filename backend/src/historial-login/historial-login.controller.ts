import { Controller, Get } from '@nestjs/common';
import { HistorialLoginService } from './historial-login.service';

@Controller('historial-login')
export class HistorialLoginController {
  constructor(private readonly historialLoginService: HistorialLoginService) {}

  @Get()
  findAll() {
    return this.historialLoginService.findAll();
  }
}
