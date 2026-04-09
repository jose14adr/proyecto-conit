import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Usuario } from './entities/usuario.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Administrador } from '../administrador/entities/administrador.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly dataSource: DataSource,
  ) {}

  // ✅ CREAR USUARIO
  async create(datosUsuario: Partial<Usuario>): Promise<Usuario> {
    if (datosUsuario.contrasenia) {
      datosUsuario.contrasenia = await bcrypt.hash(
        datosUsuario.contrasenia,
        10,
      );
    }

    const nuevoUsuario = this.usuarioRepository.create(datosUsuario);
    return await this.usuarioRepository.save(nuevoUsuario);
  }

  // ✅ BUSCAR POR CORREO
  async findOneByCorreo(correo: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { correo } });
  }

  // ✅ LISTAR
  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      order: { id: 'DESC' },
    });
  }

  // ✅ BUSCAR POR ID
  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  // ✅ UPDATE COMPLETO (ROL + MIGRACIÓN)
  async update(id: number, data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.findOne(Usuario, { where: { id } });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const rolAntiguo = usuario.rol;
      const rolNuevo = data.rol;

      // 🔐 ENCRIPTAR PASSWORD SI VIENE
      if (data.contrasenia) {
        usuario.contrasenia = await bcrypt.hash(data.contrasenia, 10);
      }

      if (data.correo) {
        usuario.correo = data.correo;
      }

      // 🔥 CAMBIO DE ROL CON MIGRACIÓN
      if (rolNuevo && rolAntiguo !== rolNuevo) {
        let perfilDatos: any = null;

        // 🔻 ELIMINAR PERFIL ANTERIOR
        if (rolAntiguo === 'ALUMNO') {
          const perfil = await manager.findOne(Alumno, {
            where: { idusuario: id },
          });
          if (perfil) {
            perfilDatos = { ...perfil };
            await manager.delete(Alumno, perfil.id);
          }
        }

        if (rolAntiguo === 'DOCENTE') {
          const perfil = await manager.findOne(Docente, {
            where: { usuario: { id } },
          });
          if (perfil) {
            perfilDatos = { ...perfil };
            await manager.delete(Docente, perfil.id);
          }
        }

        if (rolAntiguo === 'ADMINISTRADOR' || rolAntiguo === 'ADMIN') {
          const perfil = await manager.findOne(Administrador, {
            where: { idusuario: id },
          });
          if (perfil) {
            perfilDatos = { ...perfil };
            await manager.delete(Administrador, perfil.id);
          }
        }

        // 🔄 PREPARAR DATOS PARA MIGRACIÓN
        const datosMigracion = perfilDatos
          ? {
              nombre: perfilDatos.nombre || 'Por editar',
              apellido: perfilDatos.apellido || 'Por editar',
              tipodocumento:
                perfilDatos.tipodocumento ||
                perfilDatos.tipoDocumento ||
                'DNI',
              numdocumento:
                perfilDatos.numdocumento ||
                perfilDatos.numDocumento ||
                '00000000',
              telefono: perfilDatos.telefono || '',
              direccion: perfilDatos.direccion || '',
              correo: perfilDatos.correo || usuario.correo,
              idusuario: id,
              usuario: { id },
            }
          : {
              nombre: 'Usuario',
              apellido: 'Migrado',
              tipodocumento: 'DNI',
              numdocumento: '00000000',
              telefono: '',
              direccion: '',
              correo: usuario.correo,
              idusuario: id,
              usuario: { id },
            };

        // 🔺 CREAR NUEVO PERFIL SEGÚN ROL
        if (rolNuevo === 'ALUMNO') {
          await manager.save(manager.create(Alumno, datosMigracion));
        }

        if (rolNuevo === 'DOCENTE') {
          await manager.save(
            manager.create(Docente, {
              ...datosMigracion,
              tipoDocumento: datosMigracion.tipodocumento,
              numDocumento: datosMigracion.numdocumento,
            }),
          );
        }

        if (rolNuevo === 'ADMINISTRADOR' || rolNuevo === 'ADMIN') {
          await manager.save(manager.create(Administrador, datosMigracion));
        }

        usuario.rol = rolNuevo;
      }

      return await manager.save(usuario);
    });
  }

  // ✅ DESHABILITAR
  async remove(id: number) {
    await this.usuarioRepository.update(id, { estado: false });
    return { message: 'Usuario deshabilitado correctamente' };
  }

  // ✅ HABILITAR
  async habilitar(id: number) {
    await this.usuarioRepository.update(id, { estado: true });
    return { message: 'Usuario habilitado correctamente' };
  }

  // 🔐 CAMBIAR CONTRASEÑA CON HISTORIAL
  async actualizarContrasenia(id: number, contrasenia: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let historial: string[] = [];

    const raw: any = usuario.historialcontrasenias ?? [];

historial = Array.isArray(raw)
  ? raw
  : typeof raw === 'string'
  ? raw.replace(/^{|}$/g, '').split(',')
  : [];

    historial = historial.filter((p) => p && p.trim() !== '');

    // ❌ MISMA CONTRASEÑA
    const esActual = await bcrypt.compare(
      contrasenia,
      usuario.contrasenia,
    );

    if (esActual) {
      throw new BadRequestException(
        'La contraseña es igual a la actual',
      );
    }

    // ❌ HISTORIAL
    for (const hash of historial) {
      const usada = await bcrypt.compare(contrasenia, hash);
      if (usada) {
        throw new BadRequestException(
          'La contraseña ya fue utilizada anteriormente',
        );
      }
    }

    const hashed = await bcrypt.hash(contrasenia, 10);

    const nuevoHistorial = [usuario.contrasenia, ...historial].slice(0, 3);

    await this.usuarioRepository.update(id, {
      contrasenia: hashed,
      historialcontrasenias: nuevoHistorial,
    });
  }
}