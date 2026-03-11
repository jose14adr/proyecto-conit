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
      where:{
        alumno:{ id: alumnoId },
        grupo:{ id: grupoId }
      }
    });

    if(existe){
      throw new BadRequestException("Ya estás matriculado en este grupo");
    }

    // Generar serie simple
    const prefijo = nombreCurso.slice(0, 3).toUpperCase();
    const correlativo = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, "0");
    const serieGenerada = prefijo + correlativo;

    const matricula = await this.matriculaRepo.save({
      alumno:{ id: 1 },
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

}