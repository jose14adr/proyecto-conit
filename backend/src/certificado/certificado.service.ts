import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from './entities/certificado.entity';

@Injectable()
export class CertificadoService {

    constructor(
        @InjectRepository(Certificado)
        private certificadoRepo: Repository<Certificado>,
        ) {}

        async findAll() {
        return this.certificadoRepo.find({
            order: { id: 'DESC' }
        });
        }

        async findByAlumno(idalumno: number) {
            return this.certificadoRepo.find({
                where: { idalumno },
                order: { id: 'DESC' },
            });
            }
}

