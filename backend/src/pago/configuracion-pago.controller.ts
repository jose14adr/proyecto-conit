import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ConfiguracionPagoService } from './configuracion-pago.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Configuración de Pasarelas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Solo los administradores deberían tocar esto
@Controller('config-pago')
export class ConfiguracionPagoController {
  constructor(private readonly configService: ConfiguracionPagoService) {}

  // ============================
  // PASARELAS (MP, Yape, Izipay)
  // ============================
  @Get(':pasarela')
  obtenerConfig(@Param('pasarela') pasarela: string) {
    // pasarela puede ser 'mercadopago', 'yape', 'paypal', 'izipay'
    return this.configService.obtenerConfiguracion(pasarela);
  }

  @Post(':pasarela')
  guardarConfig(@Param('pasarela') pasarela: string, @Body() body: any) {
    /* El body esperado sería algo como:
       {
         "activa": true,
         "entorno": "produccion",
         "credenciales": { "access_token": "...", "public_key": "..." }
       }
    */
    return this.configService.guardarPasarela(pasarela, body);
  }

  // ============================
  // CUENTAS BANCARIAS
  // ============================
  @Get('cuentas/bancarias')
  listarCuentas() {
    return this.configService.listarCuentasBancarias();
  }

  @Post('cuentas/bancarias')
  agregarCuenta(@Body() body: any) {
    return this.configService.agregarCuentaBancaria(body);
  }

  @Delete('cuentas/bancarias/:id')
  eliminarCuenta(@Param('id', ParseIntPipe) id: number) {
    return this.configService.eliminarCuentaBancaria(id);
  }
}
