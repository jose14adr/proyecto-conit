import {
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PagoService } from './pago.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Pagos y Pasarelas')
@Controller('pago')
@UseGuards(JwtAuthGuard)
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @ApiBearerAuth()
  @Get('pendientes')
  @ApiOperation({
    summary: 'Listar todos los pagos pendientes',
    description: 'Uso administrativo para ver deudas de matrículas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de pagos pendientes.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de los pagos.' })
  getPagosPendientes() {
    return this.pagoService.getPagosPendientes();
  }

  @ApiBearerAuth()
  @Get('realizados')
  @ApiOperation({
    summary: 'Listar historial de pagos realizados',
    description: 'Uso administrativo para revisar transacciones exitosas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de transacciones exitosas.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de las transacciones.' })
  getRealizados() {
    return this.pagoService.getPagosRealizados();
  }

  @ApiBearerAuth()
  @Patch('pagar/:id')
  @ApiOperation({
    summary: 'Registrar pago de forma manual',
    description: 'Permite a un administrador marcar un pago como realizado.',
  })
  @ApiParam({ name: 'id', description: 'ID del registro de pago' })
  @ApiResponse({ status: 200, description: 'Pago actualizado a realizado.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del pago.' })
  pagar(@Param('id') id: string) {
    return this.pagoService.realizarPago(Number(id));
  }

  @Post('mercadopago/card')
  @ApiOperation({
    summary: 'Pagar con tarjeta vía Mercado Pago',
    description:
      'Procesa un pago con tarjeta utilizando la API de Mercado Pago.',
  })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del pago.' })
  @ApiBody({
    schema: {
      properties: {
        token: { type: 'string' },
        amount: { type: 'number' },
        installments: { type: 'number' },
        payment_method_id: { type: 'string' },
        payer: { type: 'object' },
      },
    },
  })
  pagarTarjeta(@Body() body: any) {
    return this.pagoService.pagarConTarjeta(body);
  }

  @Post('preferencia')
  @ApiOperation({
    summary: 'Crear preferencia de pago (Mercado Pago Checkout Pro)',
    description:
      'Genera una preferencia para redirigir al usuario a Mercado Pago.',
  })
  @ApiResponse({ status: 200, description: 'Preferencia creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de la preferencia.' })
  crearPreferencia(@Body() body: any) {
    return this.pagoService.crearPreferencia(body);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook de Mercado Pago',
    description:
      'Recibe notificaciones automáticas de cambio de estado de pagos.',
  })
  @ApiResponse({ status: 200, description: 'Webhook recibido exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del webhook.' })
  @ApiQuery({ name: 'topic', required: false })
  @ApiQuery({ name: 'id', required: false })
  webhook(@Body() body: any, @Query() query: any) {
    return this.pagoService.procesarWebhook(body);
  }

  @Post('paypal')
  @ApiOperation({
    summary: 'Procesar pago con PayPal',
    description: 'Recibe datos para procesar un pago vía PayPal.',
  })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del pago.' })
  pagarPaypal(@Body() body: any) {
    return this.pagoService.pagarConPaypal(body);
  }

  @Post('izipay')
  @ApiOperation({
    summary: 'Procesar pago con Izipay',
    description: 'Recibe datos para procesar un pago vía Izipay.',
  })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del pago.' })
  pagarIzipay(@Body() body: any) {
    return this.pagoService.pagarConIzipay(body);
  }

  @Post('estado')
  @ApiOperation({
    summary: 'Consultar estado de pago por matrícula',
    description:
      'Obtiene el estado de un pago asociado a una matrícula específica.',
  })
  @ApiResponse({ status: 200, description: 'Estado de pago obtenido exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de la matrícula.' })
  @ApiBody({
    schema: { properties: { matricula_id: { type: 'number', example: 10 } } },
  })
  async estado(@Body() body: any) {
    const pago = await this.pagoService.buscarPorMatricula(body.matricula_id);
    return { status: pago?.estado || 'pendiente' };
  }

  @Post('izipay/confirmar')
  @ApiOperation({
    summary: 'Confirmar transacción de Izipay',
    description: 'Confirma una transacción realizada a través de Izipay.',
  })
  @ApiResponse({ status: 200, description: 'Transacción confirmada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de la transacción.' })
  confirmarIzipay(@Body() body: any) {
    return this.pagoService.confirmarPagoIzipay(body.formToken, body);
  }

  @Post('izipay/webhook')
  @ApiOperation({
    summary: 'Webhook de Izipay',
    description:
      'Recibe notificaciones automáticas de cambio de estado de pagos.',
  })
  @ApiResponse({ status: 200, description: 'Webhook recibido exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del webhook.' })
  async webhookIzipay(@Body() body: any) {
    if (body.orderStatus === 'PAID') {
      const matricula_id = body.orderId;
      await this.pagoService.marcarPagado(matricula_id, body);
    }
    return { ok: true };
  }

  @Post('yape')
  @ApiOperation({
    summary: 'Procesar pago con Yape (Directo)',
    description: 'Recibe datos para procesar un pago vía Yape.',
  })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del pago.' })
  async pagarYape(@Body() body: any) {
    return this.pagoService.pagarConYape(body);
  }

  @Post('yape-mp')
  @ApiOperation({
    summary: 'Procesar pago con Yape a través de Mercado Pago',
    description: 'Recibe datos para procesar un pago vía Mercado Pago.',
  })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos del pago.' })
  pagarYapeMP(@Body() body: any) {
    return this.pagoService.pagarYapeMP(body);
  }

  @Get('verificar/:id')
  @ApiOperation({
    summary: 'Verificar datos de pago de una matrícula',
    description:
      'Obtiene los datos de un pago asociado a una matrícula específica.',
  })
  @ApiResponse({ status: 200, description: 'Datos de pago obtenidos exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos de la matrícula.' })
  @ApiParam({ name: 'id', description: 'ID de la matrícula' })
  async verificar(@Param('id', ParseIntPipe) id: number) {
    return this.pagoService.buscarPorMatricula(id);
  }
}
