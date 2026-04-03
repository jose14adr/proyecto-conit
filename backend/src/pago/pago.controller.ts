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

  @Post('paypal')
  pagarPaypal(@Body() body: any) {
    return this.pagoService.pagarConPaypal(body);
  }

@Post('izipay')
pagarIzipay(@Body() body: any) {
  return this.pagoService.pagarConIzipay(body);
}

@Post('estado')
async estado(@Body() body: any) {

  const pago = await this.pagoService.buscarPorMatricula(body.matricula_id);

  return {
    status: pago?.estado || "pendiente"
  };
}

@Post('izipay/confirmar')
confirmarIzipay(@Body() body: any) {
  return this.pagoService.confirmarPagoIzipay(body.formToken, body);
}

@Post('izipay/webhook')
async webhookIzipay(@Body() body: any) {

  console.log("🔥 WEBHOOK IZIPAY:", body);

  // 👇 esto depende de lo que te envía izipay
  if (body.orderStatus === "PAID") {

    const matricula_id = body.orderId; // 👈 AJUSTAR

    await this.pagoService.marcarPagado(matricula_id, body);

  }

  return { ok: true };
}

}