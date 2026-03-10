import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
  ) {}
  async findAll() {
    return await this.cursoRepository.find({
      order: { id: 'DESC' }, //Traemos los cursos ordenados por id de forma descendente, es decir, los más recientes primero
    });
  }

  async remove(id: number) {
    await this.cursoRepository.update(id, { estado: false });
    return { message: 'Curso inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.cursoRepository.update(id, { estado: true });
    return { message: 'Curso habilitado correctamente' };
  }
}
