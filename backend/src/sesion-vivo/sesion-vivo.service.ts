import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { supabase } from '../supabase.client';
import { SesionVivo } from './entities/sesion-vivo.entity';

@Injectable()
export class SesionVivoService {

constructor(
@InjectRepository(SesionVivo)
private sesionVivoRepository: Repository<SesionVivo>
){}

async obtenerSesiones(): Promise<SesionVivo[]> {

return this.sesionVivoRepository.find({
relations: [
'curso',
'curso.grupos',
'curso.grupos.docente'
],
order:{
fecha:'ASC'
}
})

}

}