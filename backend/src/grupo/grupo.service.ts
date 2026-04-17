import { Injectable, NotFoundException } from '@nestjs/common';
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
      where: { curso: { id: idcurso } },
      relations: ['curso', 'docente'],
    });
  }

  async asignarDocente(idGrupo: number, idDocente: number, permisos?: any) {
  const grupo = await this.grupoRepo.findOneBy({ id: idGrupo });
  if (!grupo) throw new NotFoundException('Grupo no encontrado');

  grupo.docente = { id: idDocente } as any;

  // Forzamos la conversión a String para que PostgreSQL lo guarde como JSON real
  if (permisos) {
    grupo.permisos_docente = JSON.stringify(permisos);
  } else {
    // Si no hay permisos, por seguridad bloqueamos todo por defecto
    grupo.permisos_docente = JSON.stringify({
      control_total: false,
      gestionar_contenido: false,
      gestionar_tareas: false,
      gestionar_examenes: false,
      gestionar_sesiones: false,
      tomar_asistencia: true, // Único permiso base
      gestionar_calificaciones: false,
    });
  }

  await this.grupoRepo.save(grupo);
  return { message: 'Docente y permisos asignados exitosamente' };
}

  async gruposPorDocente(iddocente: number) {
    return await this.grupoRepo.find({
      where: {
        docente: { id: iddocente },
      },
      relations: ['curso'],
      order: { id: 'DESC' },
    });
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
}
