import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
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

  async findAll() {
    return await this.alumnoRepository.find({
      order: { id: 'DESC' },
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
    const resultado = await this.dataSource.transaction(async (manager) => {
      let usuarioCreado: Usuario | undefined;

      if (data.crearUsuario) {
        const token = randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: data.correo,
            contrasenia: data.contrasenia,
            rol: 'ALUMNO',
            idempresa: 1,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          }),
        );
      }

      const alumno = manager.create(Alumno, {
        nombre: data.nombre,
        apellido: data.apellido,
        tipodocumento: data.tipodocumento,
        numdocumento: data.numdocumento,
        telefono: Number(data.telefono),
        direccion: data.direccion,
        correo: data.correo,
        lugar_residencia: data.lugar_residencia,
        departamento: data.departamento,
        provincia: data.provincia,
        distrito: data.distrito,
        estado_civil: data.estado_civil,
        nombre_editado: true,
        ...(usuarioCreado && { idUsuario: usuarioCreado.id }),
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
        );
      } catch (error) {
        console.error('No se pudo enviar el correo de verificación al alumno', error);
      }
    }

    return resultado.alumnoGuardado;
  }

  async update(id: number, data: any) {
    const { crearUsuario, contrasenia, ...datosActualizar } = data;

    let nuevoUsuario: Usuario | null = null;

    if (crearUsuario) {
      const token = randomBytes(32).toString('hex');
      const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

      nuevoUsuario = await this.usuarioRepository.save(
        this.usuarioRepository.create({
          correo: datosActualizar.correo,
          contrasenia: contrasenia,
          rol: 'ALUMNO',
          idempresa: 1,
          emailVerificado: false,
          tokenVerificacion: token,
          tokenVerificacionExpira: expiracion,
        }),
      );

      datosActualizar.idUsuario = nuevoUsuario.id;
    }

    await this.alumnoRepository.update(id, datosActualizar);
    const alumnoActualizado = await this.findOne(id);

    if (nuevoUsuario?.tokenVerificacion) {
      try {
        await this.mailService.sendEmailVerificacion(
          alumnoActualizado.nombre || 'Alumno',
          nuevoUsuario.correo,
          nuevoUsuario.tokenVerificacion,
        );
      } catch (error) {
        console.error('No se pudo enviar el correo de verificación al alumno', error);
      }
    }

    return alumnoActualizado;
  }

  async remove(id: number) {
    await this.alumnoRepository.update(id, { estado: false });
    return { message: 'Alumno inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.alumnoRepository.update(id, { estado: true });
    return { message: 'Alumno habilitado correctamente' };
  }
}