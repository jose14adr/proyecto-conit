import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { Docente } from '../docente/entities/docente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class DocenteService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepository: Repository<Docente>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async findAll() {
    return await this.docenteRepository.find({
      relations: ['usuario', 'cursosAdicionales'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const docente = await this.docenteRepository.findOne({
      where: { id },
      relations: ['usuario', 'cursosAdicionales'],
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return docente;
  }

  async create(data: any) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const { contrasenia, crearUsuario, ...datosDocente } = data;

      let usuarioCreado: Usuario | null = null;

      if (crearUsuario && contrasenia) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const token = randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: datosDocente.correo,
            contrasenia: hashedPassword,
            rol: 'DOCENTE',
            idempresa: 1,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          }),
        );
      }

      const docente = manager.create(Docente, {
        ...datosDocente,
        ...(usuarioCreado && { usuario: usuarioCreado }),
      });

      const docenteGuardado = await manager.save(docente);

      return { docenteGuardado, usuarioCreado };
    });

    // 📧 Envío de correo fuera de la transacción
    if (resultado.usuarioCreado?.tokenVerificacion) {
      try {
        await this.mailService.sendEmailVerificacion(
          resultado.docenteGuardado.nombre || 'Docente',
          resultado.usuarioCreado.correo,
          resultado.usuarioCreado.tokenVerificacion,
        );
      } catch (error) {
        console.error(
          'No se pudo enviar el correo de verificación al docente',
          error,
        );
      }
    }

    return resultado.docenteGuardado;
  }

  async update(id: number, data: any) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const docente = await manager.findOne(Docente, {
        where: { id },
        relations: ['usuario'],
      });

      if (!docente) throw new NotFoundException('Docente no encontrado');

      const { crearUsuario, contrasenia, ...datosActualizar } = data;

      let nuevoUsuario: Usuario | null = null;

      if (crearUsuario && contrasenia && !docente.usuario) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const token = randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        nuevoUsuario = await manager.save(
          manager.create(Usuario, {
            correo: datosActualizar.correo || docente.correo,
            contrasenia: hashedPassword,
            rol: 'DOCENTE',
            idempresa: 1,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          }),
        );

        datosActualizar.usuario = { id: nuevoUsuario.id };
      }

      await manager.update(Docente, id, datosActualizar);

      const docenteActualizado = await manager.findOne(Docente, {
        where: { id },
        relations: ['usuario', 'cursosAdicionales'],
      });

      return { docenteActualizado, nuevoUsuario };
    });

    // 📧 Envío de correo
    if (resultado.nuevoUsuario?.tokenVerificacion) {
      try {
        await this.mailService.sendEmailVerificacion(
          resultado.docenteActualizado?.nombre || 'Docente',
          resultado.nuevoUsuario.correo,
          resultado.nuevoUsuario.tokenVerificacion,
        );
      } catch (error) {
        console.error(
          'No se pudo enviar el correo de verificación al docente',
          error,
        );
      }
    }

    return resultado.docenteActualizado;
  }

  async remove(id: number) {
    await this.docenteRepository.update(id, { estado: false });

    const docente = await this.findOne(id);

    if (docente.usuario?.id) {
      await this.usuarioRepository.update(docente.usuario.id, {
        estado: false,
      });
    }

    return { message: 'Docente inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.docenteRepository.update(id, { estado: true });

    const docente = await this.findOne(id);

    if (docente.usuario?.id) {
      await this.usuarioRepository.update(docente.usuario.id, {
        estado: true,
      });
    }

    return { message: 'Docente habilitado correctamente' };
  }
}
