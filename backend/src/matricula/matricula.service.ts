import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matricula } from './entities/matricula.entity';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,
  ) {}

  async crear(alumnoId: number, grupoId: number, nombreCurso: string) {
    const existe = await this.matriculaRepo.findOne({
      where: {
        alumno: { id: alumnoId },
        grupo: { id: grupoId },
      },
    });

    if (existe) {
      throw new BadRequestException('Ya estás matriculado en este grupo');
    }

    // Generar serie simple
    const prefijo = nombreCurso.slice(0, 3).toUpperCase();
    const correlativo = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0');
    const serieGenerada = prefijo + correlativo;

    const matricula = await this.matriculaRepo.save({
      alumno:{ id: alumnoId },
      grupo:{ id: grupoId },

      estado:"pendiente",

      observacion:`Matrícula de ${nombreCurso}`,
      serie:serieGenerada,
      beneficio:"NINGUNO",
      pacademico:"",

      idadministrador:1,
      idcertificado:1,
      idcontrolacademico:1
    });
    

    return matricula;
  }

  async findByAlumno(idalumno: number) {
  return await this.matriculaRepo.find({
    where: {
      alumno: { id: idalumno }
    },
    relations: ['grupo'],
    order: {
      created_at: 'DESC'
    }
  });
}

}

