import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entities/grupo.entity';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private grupoRepo: Repository<Grupo>,
  ) {}

  async gruposPorCurso(idcurso: number) {
    return this.grupoRepo.find({
      where: {
        curso: {
          id: idcurso,
        },
      },
      relations: ['curso', 'docente'],
    });
  }
  async asignarDocente(idGrupo: number, idDocente: number) {
    await this.grupoRepo.update(idGrupo, { docente: { id: idDocente } });
    return { message: 'Docente asignado al grupo exitosamente' };
  }
  async create(data: any) {
    const nuevoGrupo = this.grupoRepo.create({
      nombregrupo: data.nombregrupo,
      horario: data.horario,
      modalidad: data.modalidad,
      cantidadpersonas: data.cantidadpersonas,
      curso: { id: data.idcurso },
    });

    return await this.grupoRepo.save(nuevoGrupo);
  }
  async gruposPorDocente(iddocente: number) {
    return await this.grupoRepo.find({
      where: {
        docente: {
          id: iddocente,
        },
      },
      relations: ['curso'],
      order: {
        id: 'DESC',
      },
    });
  }
}
