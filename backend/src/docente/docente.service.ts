import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import { Docente } from '../docente/entities/docente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateDocenteDto } from '../docente/dto/create-docente.dto';
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
      relations: ['usuario'],
      order: { id: 'DESC' },
    });
  }

  async create(data: CreateDocenteDto) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      let usuarioCreado: Usuario | undefined;

      if (data.crearUsuario) {
        const token = randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: data.correo,
            contrasenia: data.contrasenia,
            rol: 'DOCENTE',
            idempresa: 1,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          }),
        );
      }

      const docente = manager.create(Docente, {
        nombre: data.nombre,
        apellido: data.apellido,
        tipoDocumento: data.tipoDocumento,
        numDocumento: data.numDocumento,
        telefono: data.telefono,
        direccion: data.direccion,
        correo: data.correo,
        ...(usuarioCreado && { usuario: usuarioCreado }),
      });

      const docenteGuardado = await manager.save(docente);

      return { docenteGuardado, usuarioCreado };
    });

    if (resultado.usuarioCreado?.tokenVerificacion) {
      try {
        await this.mailService.sendEmailVerificacion(
          resultado.docenteGuardado.nombre || 'Docente',
          resultado.usuarioCreado.correo,
          resultado.usuarioCreado.tokenVerificacion,
        );
      } catch (error) {
        console.error('No se pudo enviar el correo de verificación al docente', error);
      }
    }

    return resultado.docenteGuardado;
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
          rol: 'DOCENTE',
          idempresa: 1,
          emailVerificado: false,
          tokenVerificacion: token,
          tokenVerificacionExpira: expiracion,
        }),
      );

      datosActualizar.usuario = nuevoUsuario;
    }

    await this.docenteRepository.update(id, datosActualizar);
    const docenteActualizado = await this.docenteRepository.findOne({ where: { id } });

    if (nuevoUsuario?.tokenVerificacion && docenteActualizado) {
      try {
        await this.mailService.sendEmailVerificacion(
          docenteActualizado.nombre || 'Docente',
          nuevoUsuario.correo,
          nuevoUsuario.tokenVerificacion,
        );
      } catch (error) {
        console.error('No se pudo enviar el correo de verificación al docente', error);
      }
    }

    return docenteActualizado;
  }

  async remove(id: number) {
    await this.docenteRepository.update(id, { estado: false });
    return { message: 'Docente inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.docenteRepository.update(id, { estado: true });
    return { message: 'Docente habilitado correctamente' };
  }
}