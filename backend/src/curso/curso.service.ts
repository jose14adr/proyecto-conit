import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Grupo } from 'src/grupo/entities/grupo.entity';
import { Matricula } from 'src/matricula/entities/matricula.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
    @InjectRepository(Matricula)
    private readonly matriculaRepository: Repository<Matricula>,
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

  // 🔥 Se obtienen los cursos mediante las matrículas del alumno (Versión Nube)
  async listarCursosAlumno(idAlumno: number): Promise<Matricula[]> {
    return this.matriculaRepository.find({
      where: {
        alumno: { id: idAlumno },
      },
      relations: ['grupo', 'grupo.curso', 'grupo.docente'],
    });
  }

  // 🔥 Consulta combinada: Trae todo el detalle y valida matrícula si se provee el alumno
  async obtenerUnoCursoAlumno(idCurso: number, idAlumno?: number) {
    const query = this.cursoRepository.createQueryBuilder('curso');

    if (idAlumno) {
      // VALIDAR MATRÍCULA (Si viene desde la vista del alumno)
      query
        .innerJoin('curso.grupos', 'grupo')
        .innerJoin('grupo.matriculas', 'matricula')
        .innerJoin('matricula.alumno', 'alumno')
        .where('curso.id = :idCurso', { idCurso })
        .andWhere('alumno.id = :idAlumno', { idAlumno });
    } else {
      // BÚSQUEDA GENERAL (Si viene desde la vista general del curso)
      query.where('curso.id = :idCurso', { idCurso });
    }

    return (
      query
        // ESTRUCTURA DEL CURSO (Tu versión local)
        .leftJoinAndSelect('curso.temario', 'temario')
        .leftJoinAndSelect('temario.unidades', 'unidad')
        .leftJoinAndSelect('unidad.sesion', 'sesion')

        // MÓDULOS Y LECCIONES (Ambas versiones)
        .leftJoinAndSelect('curso.modulos', 'modulo')
        .leftJoinAndSelect('modulo.lecciones', 'leccion')
        .leftJoinAndSelect('leccion.materiales', 'material')

        // EXÁMENES (Versión Nube)
        .leftJoinAndSelect('leccion.examenes', 'examen')
        .leftJoinAndSelect('examen.preguntas', 'pregunta')
        .leftJoinAndSelect('pregunta.opciones', 'opcion')

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
