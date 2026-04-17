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
      where: { id },
      relations: ['grupos', 'grupos.docente'],
    });
  }

  async findAll() {
    return this.cursoRepository.find({
      relations: [
        'grupos',
        'grupos.docente',
        'temario',
        'temario.unidades',
        'temario.unidades.sesion',
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
        'temario.unidades.sesion',
      ],
    });
  }

  async obtenerUnoCursoAlumno(id: number) {
    return (
      this.cursoRepository
        .createQueryBuilder('curso')

        .leftJoinAndSelect('curso.grupos', 'grupos')

        .leftJoinAndSelect('curso.temario', 'temario')
        .leftJoinAndSelect('temario.unidades', 'unidad')
        .leftJoinAndSelect('unidad.sesion', 'sesion')

        .leftJoinAndSelect('curso.modulos', 'modulo')
        .leftJoinAndSelect('modulo.lecciones', 'leccion')
        .leftJoinAndSelect('leccion.materiales', 'material')

        .where('curso.id = :id', { id })
        .getOne()
    );
  }

  async remove(id: number) {
    await this.cursoRepository.update(id, { estado: false });
    return { message: 'Curso inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.cursoRepository.update(id, { estado: true });
    return { message: 'Curso habilitado correctamente' };
  }

  async create(data: Partial<Curso>) {
    const nuevoCurso = this.cursoRepository.create(data);
    return this.cursoRepository.save(nuevoCurso);
  }

  async update(id: number, data: Partial<Curso>) {
    await this.cursoRepository.update(id, data);
    return this.obtenerUno(id);
  }
}
