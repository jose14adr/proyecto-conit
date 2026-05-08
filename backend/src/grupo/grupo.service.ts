import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entities/grupo.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private grupoRepo: Repository<Grupo>,

    private readonly mailService: MailService,
  ) {}

  async gruposPorCurso(idcurso: number) {
    return this.grupoRepo.find({
      where: {
        curso: {
          id: idcurso,
        },
      },
      relations: ['curso', 'docente', 'docente.usuario'],
      order: {
        id: 'DESC',
      },
    });
  }

    async asignarDocente(idGrupo: number, idDocente: number, permisos?: any) {
    const grupo = await this.grupoRepo.findOneBy({ id: idGrupo });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    grupo.docente = { id: idDocente } as any;

    if (permisos) {
      grupo.permisos_docente = JSON.stringify(permisos);
    } else {
      grupo.permisos_docente = JSON.stringify({
        control_total: false,
        gestionar_contenido: false,
        gestionar_tareas: false,
        gestionar_examenes: false,
        gestionar_sesiones: false,
        tomar_asistencia: true,
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
      estado: 'ACTIVO',
      fechaCierre: null,
      correoCierreDocenteEnviado: false,
    });
    return await this.grupoRepo.save(nuevoGrupo);
  }

  async actualizarEstado(idGrupo: number, estado: string) {
    const estadoNormalizado = String(estado || '').toUpperCase().trim();

    if (!['ACTIVO', 'PAUSADO', 'CERRADO'].includes(estadoNormalizado)) {
      throw new BadRequestException('Estado no válido');
    }

    if (estadoNormalizado === 'CERRADO') {
      return this.cerrarGrupo(idGrupo);
    }

    const grupo = await this.grupoRepo.findOne({
      where: { id: idGrupo },
      relations: ['curso', 'docente', 'docente.usuario'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    grupo.estado = estadoNormalizado;

    if (estadoNormalizado !== 'CERRADO') {
      grupo.fechaCierre = null;
    }

    const saved = await this.grupoRepo.save(grupo);

    return {
      message: 'Estado del grupo actualizado correctamente',
      grupo: saved,
    };
  }

  async cerrarGrupo(idGrupo: number) {
    const grupo = await this.grupoRepo.findOne({
      where: { id: idGrupo },
      relations: ['curso', 'docente', 'docente.usuario'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    if (grupo.estado === 'CERRADO') {
      return {
        message: 'El grupo ya estaba cerrado',
        grupo,
      };
    }

    grupo.estado = 'CERRADO';
    grupo.fechaCierre = new Date();

    let saved = await this.grupoRepo.save(grupo);

    try {
      const usuarioDocente = grupo.docente?.usuario;

      if (
        usuarioDocente?.emailVerificado &&
        !grupo.correoCierreDocenteEnviado
      ) {
        await this.mailService.sendCursoCerradoDocente(
          grupo.docente?.nombre || 'Docente',
          usuarioDocente.correo,
          grupo.curso?.nombrecurso || 'Curso',
          grupo.nombregrupo || `Grupo ${grupo.id}`,
        );

        saved.correoCierreDocenteEnviado = true;
        saved = await this.grupoRepo.save(saved);
      }
    } catch (error) {
      console.error('No se pudo enviar el correo de cierre al docente', error);
    }

    return {
      message: 'Grupo cerrado correctamente',
      grupo: saved,
    };
  }

  async obtenerPorAlumno(idalumno: number) {
    return this.grupoRepo.query(`
      SELECT DISTINCT g.*, c.nombrecurso
      FROM grupo g
      INNER JOIN curso c ON c.id = g.idcurso
      INNER JOIN matricula m ON m.idgrupo = g.id
      WHERE m.idalumno = $1
    `, [idalumno]);
  }
}
