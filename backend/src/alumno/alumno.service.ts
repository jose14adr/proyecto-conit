import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Alumno } from './entities/alumno.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async getPerfil(userId: number) {
    const alumno = await this.alumnoRepository.findOne({
      where: { idusuario: userId },
      relations: ['usuario'],
    });

    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    return alumno;
  }

  async buscarPorIdUsuario(idusuario: number): Promise<Alumno | null> {
      if (!idusuario || isNaN(idusuario)) {
        return null;
      }
      return this.alumnoRepository.findOne({ where: { idusuario } });
    }

  async findAll() {
    return await this.alumnoRepository.find({
      order: { id: 'DESC' },
      relations: ['matriculas', 'matriculas.grupo', 'matriculas.grupo.curso'],
    });
  }

  async findOne(id: number) {
    const alumno = await this.alumnoRepository.findOneBy({ id });

    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    return alumno;
  }

  async create(data: any) {
    const { contrasenia, crearUsuario, ...datosAlumno } = data;

    const resultado = await this.dataSource.transaction(async (manager) => {
      let usuarioCreado: Usuario | null = null;

      if (crearUsuario && contrasenia) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const token = randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: datosAlumno.correo,
            contrasenia: hashedPassword,
            rol: 'ALUMNO',
            idempresa: 1,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          }),
        );
      }

      const alumno = manager.create(Alumno, {
        ...datosAlumno,
        nombre_editado: true,
        ...(usuarioCreado && { idusuario: usuarioCreado.id }),
      });

      const alumnoGuardado = await manager.save(alumno);

      return { alumnoGuardado, usuarioCreado };
    });

    if (resultado.usuarioCreado?.tokenVerificacion) {
      try {
        await this.mailService.sendEmailVerificacion(
          resultado.alumnoGuardado.nombre || 'Alumno',
          resultado.usuarioCreado.correo,
          resultado.usuarioCreado.tokenVerificacion,
          resultado.usuarioCreado.correo,
          contrasenia,
        );
      } catch (error) {
        console.error(
          'No se pudo enviar el correo de verificación al alumno',
          error,
        );
      }
    }

    return resultado.alumnoGuardado;
  }

  async update(id: number, data: any) {
    const { crearUsuario, contrasenia, ...datosActualizarBase } = data;

    const resultado = await this.dataSource.transaction(async (manager) => {
      const alumno = await manager.findOne(Alumno, { where: { id } });

      if (!alumno) {
        throw new NotFoundException('Alumno no encontrado');
      }

      const datosActualizar = { ...datosActualizarBase };
      let nuevoUsuario: Usuario | null = null;

      if (crearUsuario && contrasenia && !alumno.idusuario) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const token = randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        nuevoUsuario = await manager.save(
          manager.create(Usuario, {
            correo: datosActualizar.correo || alumno.correo,
            contrasenia: hashedPassword,
            rol: 'ALUMNO',
            idempresa: 1,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          }),
        );

        datosActualizar.idusuario = nuevoUsuario.id;
      }

      await manager.update(Alumno, id, datosActualizar);

      const alumnoActualizado = await manager.findOne(Alumno, {
        where: { id },
      });

      return { alumnoActualizado, nuevoUsuario };
    });

    if (resultado.nuevoUsuario?.tokenVerificacion) {
      try {
        await this.mailService.sendEmailVerificacion(
          resultado.alumnoActualizado?.nombre || 'Alumno',
          resultado.nuevoUsuario.correo,
          resultado.nuevoUsuario.tokenVerificacion,
          resultado.nuevoUsuario.correo,
          contrasenia,
        );
      } catch (error) {
        console.error(
          'No se pudo enviar el correo de verificación al alumno',
          error,
        );
      }
    }

    return resultado.alumnoActualizado;
  }

  async remove(id: number) {
    await this.alumnoRepository.update(id, { estado: false });

    const alumno = await this.findOne(id);

    if (alumno.idusuario) {
      await this.usuarioRepository.update(alumno.idusuario, { estado: false });
    }

    return { message: 'Alumno inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.alumnoRepository.update(id, { estado: true });

    const alumno = await this.findOne(id);

    if (alumno.idusuario) {
      await this.usuarioRepository.update(alumno.idusuario, { estado: true });
    }

    return { message: 'Alumno habilitado correctamente' };
  }
}