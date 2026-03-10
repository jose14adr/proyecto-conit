import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Docente } from '../docente/entities/docente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateDocenteDto } from '../docente/dto/create-docente.dto';

@Injectable()
export class DocenteService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepository: Repository<Docente>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return await this.docenteRepository.find({
      relations: ['usuario'],
      order: { id: 'DESC' },
    });
  }

  async create(data: CreateDocenteDto) {
    return await this.dataSource.transaction(async (manager) => {
      let usuarioCreado: Usuario | undefined;

      if (data.crearUsuario) {
        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: data.correo,
            contrasenia: data.contrasenia,
            rol: 'DOCENTE',
            idempresa: 1,
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

      return await manager.save(docente);
    });
  }

  async update(id: number, data: any) {
    //Al actualizar, si se indica crearUsuario, se crea un nuevo usuario y se asocia al docente. Si no, solo se actualizan los datos del docente.
    const { crearUsuario, contrasenia, ...datosActualizar } = data;
    //Si el frontend envía crearUsuario como true, se crea un nuevo usuario con la contraseña proporcionada y se asocia al docente. Si no, solo se actualizan los datos del docente sin modificar la relación con el usuario.
    if(crearUsuario) {
      //Creamos el nuevo usuario en la tabla Usuario
      const nuevoUsuario = this.usuarioRepository.save(
        this.usuarioRepository.create({
          correo: datosActualizar.correo,
          contrasenia: contrasenia,
          rol: 'DOCENTE',
          idempresa: 1,
        })
      );
      //Se lo asignamos al docente a través de la relación
      datosActualizar.usuario = nuevoUsuario;
    }
    //Actualizamos el docente con sus datos (y su nuevo usuario si se indicó crearUsuario)
    await this.docenteRepository.update(id, datosActualizar);
    return this.docenteRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.docenteRepository.update(id, { estado: 'INACTIVO' });
    return { message: 'Docente inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.docenteRepository.update(id, { estado: 'ACTIVO' });
    return { message: 'Docente habilitado correctamente' };
  }
}
