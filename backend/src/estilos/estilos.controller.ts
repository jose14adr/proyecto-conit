import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EstilosService } from './estilos.service';
import { ActualizarEstiloConfiguracionDto } from './dto/actualizar-estilo-configuracion.dto';
import { CrearEstiloColorDto } from './dto/crear-estilo-color.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Estilos globales')
@Controller('estilos')
export class EstilosController {
  constructor(private readonly estilosService: EstilosService) {}

  // Público: lo usará toda la app, incluso la web pública.
  @Get('configuracion')
  obtenerConfiguracionPublica() {
    return this.estilosService.obtenerConfiguracionPublica();
  }

  // Público o admin: sirve para pintar la paleta.
  @Get('colores')
  listarColores() {
    return this.estilosService.listarColores();
  }

  // Admin: devuelve configuración completa con IDs y valores resueltos.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('configuracion/admin')
  obtenerConfiguracionAdmin() {
    return this.estilosService.obtenerConfiguracionAdmin();
  }

  // Admin: actualizar configuración global.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('configuracion')
  actualizarConfiguracion(@Body() dto: ActualizarEstiloConfiguracionDto) {
    return this.estilosService.actualizarConfiguracion(dto);
  }

  // Admin: agregar colores nuevos a la paleta.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('colores')
  crearColor(@Body() dto: CrearEstiloColorDto) {
    return this.estilosService.crearColor(dto);
  }
}