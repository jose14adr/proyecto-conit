import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from './entities/administrador.entity';

@Injectable()
export class AdministradorService {
    constructor(
        @InjectRepository(Administrador)
        private administradorRepository: Repository<Administrador>,
    ) {}

    async buscarPorIdUsuario(idusuario: number): Promise<Administrador | null> {
        return this.administradorRepository.findOne({ where: { idusuario } });
    }
}
