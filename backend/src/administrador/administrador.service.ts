import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Administrador } from './entities/administrador.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdministradorService {
  constructor(
    @InjectRepository(Administrador)
    private administradorRepository: Repository<Administrador>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return await this.administradorRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const admin = await this.administradorRepository.findOneBy({ id });
    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return admin;
  }

  async buscarPorIdUsuario(idusuario: number): Promise<Administrador | null> {
    if (!idusuario || isNaN(idusuario)) {
      return null;
    }
    return this.administradorRepository.findOne({ where: { idusuario } });
  }

  async create(data: CreateAdministradorDto) {
    return await this.dataSource.transaction(async (manager) => {
      const { contrasenia, crearUsuario, ...datosAdmin } = data;

      const passToHash = contrasenia || '';
      const hashedPassword = await bcrypt.hash(passToHash, 10);

      const usuarioCreado = await manager.save(
        manager.create(Usuario, {
          correo: datosAdmin.correo,
          contrasenia: hashedPassword,
          rol: 'ADMINISTRADOR',
          idempresa: 1,
        }),
      );

      const administrador = manager.create(Administrador, {
        ...datosAdmin,
        idusuario: usuarioCreado.id,
      });

      return await manager.save(administrador);
    });
  }

  async update(id: number, data: any) {
    const { crearUsuario, contrasenia, ...datosActualizar } = data;

    await this.administradorRepository.update(id, datosActualizar);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.administradorRepository.update(id, { estado: false });

    const admin = await this.findOne(id);
    if (admin.idusuario) {
      await this.usuarioRepository.update(admin.idusuario, { estado: false });
    }
    return { message: 'Administrador inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.administradorRepository.update(id, { estado: true });
    
    const admin = await this.findOne(id);
    if (admin.idusuario) {
      await this.usuarioRepository.update(admin.idusuario, { estado: true });
    }
    return { message: 'Administrador habilitado correctamente' };
  }
}
