import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matricula } from './entities/matricula.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,

    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,

    private readonly mailService: MailService,
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

    const prefijo = nombreCurso.slice(0, 3).toUpperCase();
    const correlativo = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0');
    const serieGenerada = prefijo + correlativo;

    const matricula = await this.matriculaRepo.save({
      alumno: { id: alumnoId },
      grupo: { id: grupoId },
      estado: 'pendiente',
      observacion: `Matrícula de ${nombreCurso}`,
      serie: serieGenerada,
      beneficio: 'NINGUNO',
      pacademico: '',
      idadministrador: 1,
      idcertificado: 1,
      idcontrolacademico: 1,
    });

    // Enviar correo de bienvenida (Agregado en main)
    try {
      const alumno = await this.alumnoRepo.findOne({
        where: { id: alumnoId },
      });

      if (alumno?.idusuario) {
        const usuario = await this.usuarioRepo.findOne({
          where: { id: alumno.idusuario },
        });

        if (usuario?.emailVerificado) {
          await this.mailService.sendBienvenidaAlumno(
            alumno.nombre || 'Alumno',
            usuario.correo,
            nombreCurso,
          );
        }
      }
    } catch (error) {
      console.error(
        'No se pudo enviar el correo de bienvenida de matrícula',
        error,
      );
    }

    return matricula;
  }

  async findByAlumno(idalumno: number) {
    return await this.matriculaRepo.find({
      where: {
        alumno: { id: idalumno },
      },
      relations: ['grupo'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  // Función para listar alumnos por curso (Agregada en tu rama HEAD)
  async obtenerAlumnosPorCurso(idcurso: number) {
    const matriculas = await this.matriculaRepo.find({
      where: {
        grupo: {
          curso: { id: idcurso },
        },
      },
      relations: ['alumno', 'grupo'],
    });

    return matriculas
      .filter((m) => m.alumno != null)
      .map((m) => ({
        ...m.alumno,
        idmatricula: m.id,
        grupo_asignado: m.grupo ? m.grupo.nombregrupo : 'Sin grupo',
      }));
  }
  async actualizarPermisosCertificado(
    idMatricula: number,
    puedeVer: boolean,
    puedeDescargar: boolean,
  ) {
    const matricula = await this.matriculaRepo.findOne({
      where: { id: idMatricula },
    });
    if (!matricula) throw new BadRequestException('Matrícula no encontrada');

    matricula.puede_ver_certificado = puedeVer;
    matricula.puede_descargar_certificado = puedeDescargar;

    // Validar lógicamente: si no puede ver, no puede descargar
    if (!puedeVer) {
      matricula.puede_descargar_certificado = false;
    }

    await this.matriculaRepo.save(matricula);

    return { message: 'Permisos de certificado actualizados correctamente' };
  }
}
