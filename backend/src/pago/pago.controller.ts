import { Controller, Get, Patch, Param, Post, Body } from '@nestjs/common';
import { PagoService } from './pago.service';

@Controller('pago')
export class PagoController {

  constructor(private readonly pagoService: PagoService) {}

  @Get('pendientes')
  getPagosPendientes() {
    return this.pagoService.getPagosPendientes();
  }


  @Get('realizados')
  getRealizados() {
    return this.pagoService.getPagosRealizados();
  }

  @Patch('pagar/:id')
  pagar(@Param('id') id: string) {
    return this.pagoService.realizarPago(Number(id));
  }

  @Post('mercadopago/card')
async pagarTarjeta(@Body() body) {
  return this.pagoService.pagarConTarjeta(body);
}
}