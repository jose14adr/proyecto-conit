import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Alumno } from './entities/alumno.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return await this.alumnoRepository.find({
      order: { id: 'DESC' }, //Traemos los alumnos ordenados por id de forma descendente, es decir, los más recientes primero
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
    return await this.dataSource.transaction(async (manager) => {
      let usuarioCreado: Usuario | undefined;

      if (data.crearUsuario) {
        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: data.correo,
            contrasenia: data.contrasenia,
            rol: 'ALUMNO',
            idempresa: 1,
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
      return await manager.save(alumno);
    });
  }

  async update(id: number, data: any) {
    const { crearUsuario, contrasenia, ...datosActualizar } = data;

    if (crearUsuario) {
      const nuevoUsuario = await this.usuarioRepository.save(
        this.usuarioRepository.create({
          correo: datosActualizar.correo,
          contrasenia: contrasenia,
          rol: 'ALUMNO',
          idempresa: 1,
        }),
      );
      datosActualizar.idUsuario = nuevoUsuario.id;
    }

    await this.alumnoRepository.update(id, datosActualizar);
    return this.findOne(id);
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
