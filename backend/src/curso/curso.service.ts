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

  async listarCursos(): Promise<Curso[]> {
    return await this.cursoRepository.find();
  }

  async obtenerUno(id: number) {
    return this.cursoRepository.findOne({
        where: { id }
    });
    }

  async findAll() {
    return this.cursoRepository.find({
      relations: [
        'grupos',
        'grupos.docente',
        'temario',
        'temario.unidades',
        'temario.unidades.sesion'
      ],
    });
  }

  async listarCursosAlumno(): Promise<Curso[]> {
    return this.cursoRepository.find({
      relations: [
        'grupos',
        'grupos.docente',
        'temario',
        'temario.unidades',
        'temario.unidades.sesion'
      ]
    });
  }

async obtenerUnoCursoAlumno(id: number): Promise<Curso | null> {
  return this.cursoRepository.findOne({
    where: { id },
    relations: [
      'grupos',
      'grupos.docente',
      'temario',
      'temario.unidades',
      'temario.unidades.sesion'
    ]
  });
}

}