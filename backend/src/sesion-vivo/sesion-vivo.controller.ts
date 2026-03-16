import { Controller, Get } from '@nestjs/common';
import { SesionVivoService } from './sesion-vivo.service';
import { SesionVivo } from './entities/sesion-vivo.entity';

@Controller('sesion-vivo')
export class SesionVivoController {

constructor(private service: SesionVivoService){}

@Get()
async obtener(): Promise<SesionVivo[]> {
return this.service.obtenerSesiones()
}

}