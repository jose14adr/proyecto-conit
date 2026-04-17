import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import { Alumno } from './entities/alumno.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import * as bcrypt from 'bcrypt';
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
    // 1. Ejecutamos la transacción en la base de datos
    const resultado = await this.dataSource.transaction(async (manager) => {
      const { contrasenia, crearUsuario, ...datosAlumno } = data;

      let usuarioCreado: Usuario | null = null;

      // Crear credenciales y tokens si se solicita
      if (crearUsuario && contrasenia) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);
        const token = randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: datosAlumno.correo,
            contrasenia: hashedPassword, // ¡Hasheada!
            rol: 'ALUMNO',
            idempresa: 1,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          }),
        );
      }

      // Crear el perfil del alumno
      const alumnoParams: any = {
        ...datosAlumno,
        nombre_editado: true,
      };

      if (usuarioCreado) {
        alumnoParams.idusuario = usuarioCreado.id;
      }

      const alumno = manager.create(Alumno, alumnoParams);
      const alumnoGuardado = await manager.save(alumno);

      return { alumnoGuardado, usuarioCreado };
    });

    // 2. Enviar el correo de verificación (Fuera de la transacción por si el correo falla)
    if (resultado.usuarioCreado?.tokenVerificacion) {
      try {
        await this.mailService.sendEmailVerificacion(
          resultado.alumnoGuardado.nombre || 'Alumno',
          resultado.usuarioCreado.correo,
          resultado.usuarioCreado.tokenVerificacion,
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
    // 1. Transacción de base de datos
    const resultado = await this.dataSource.transaction(async (manager) => {
      const alumno = await manager.findOne(Alumno, { where: { id } });
      if (!alumno) throw new NotFoundException('Alumno no encontrado');

      const { crearUsuario, contrasenia, ...datosActualizar } = data;
      let nuevoUsuario: Usuario | null = null;

      // Si se edita el alumno y deciden crearle su usuario
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

    // Inhabilitamos también su usuario para revocar acceso
    const alumno = await this.findOne(id);
    if (alumno.idusuario) {
      await this.usuarioRepository.update(alumno.idusuario, { estado: false });
    }

    return { message: 'Alumno inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.alumnoRepository.update(id, { estado: true });

    // Habilitar credenciales
    const alumno = await this.findOne(id);
    if (alumno.idusuario) {
      await this.usuarioRepository.update(alumno.idusuario, { estado: true });
    }

    return { message: 'Alumno habilitado correctamente' };
  }
}
