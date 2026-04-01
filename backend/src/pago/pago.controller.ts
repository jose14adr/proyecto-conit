import { Controller, Get, Patch, Param, Post, Body, Query } from '@nestjs/common';
import { PagoService } from './pago.service';

@Controller('pago')
export class PagoController {

  constructor(private readonly pagoService: PagoService) {}

  // PAGOS PENDIENTES
  @Get('pendientes')
  getPagosPendientes() {
    return this.pagoService.getPagosPendientes();
  }

  // PAGOS REALIZADOS
  @Get('realizados')
  getRealizados() {
    return this.pagoService.getPagosRealizados();
  }

  // PAGO MANUAL
  @Patch('pagar/:id')
  pagar(@Param('id') id: string) {
    return this.pagoService.realizarPago(Number(id));
  }

  // PAGO CON TARJETA
  @Post('mercadopago/card')
  pagarTarjeta(@Body() body: any) {
    return this.pagoService.pagarConTarjeta(body);
  }

  // WEBHOOK
  @Post('webhook')
  webhook(@Body() body: any, @Query() query: any) {
    return this.pagoService.procesarWebhook(body);
  }

}