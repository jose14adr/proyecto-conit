import {
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Body,
  Query,
} from '@nestjs/common';
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
    pagarTarjeta(@Body() body: any) {
      console.log("📩 BODY:", body)
      return this.pagoService.pagarConTarjeta(body);
    }
  @Post("preferencia")
    crearPreferencia(@Body() body: any) {
      return this.pagoService.crearPreferencia(body);
    }

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
      status: pago?.estado || 'pendiente',
    };
  }

  @Post('izipay/confirmar')
  confirmarIzipay(@Body() body: any) {
    return this.pagoService.confirmarPagoIzipay(body.formToken, body);
  }

  @Post('izipay/webhook')
  async webhookIzipay(@Body() body: any) {
    console.log('🔥 WEBHOOK IZIPAY:', body);

    if (body.orderStatus === 'PAID') {
      const matricula_id = body.orderId;

      await this.pagoService.marcarPagado(matricula_id, body);
    }

    return { ok: true };
  }
  @Post('yape')
async pagarYape(@Body() body: any) {
  return this.pagoService.pagarConYape(body)
}

@Post('yape-mp')
pagarYapeMP(@Body() body: any) {
  return this.pagoService.pagarYapeMP(body)
}

 @Get('verificar/:id')
async verificar(@Param('id') id: number) {
  return this.pagoService.buscarPorMatricula(Number(id))
}
  
}
