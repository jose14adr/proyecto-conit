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

async listarCursosAlumno(idAlumno: number): Promise<Matricula[]> {
  return this.matriculaRepository.find({
    where: {
      alumno: { id: idAlumno },
    },
    relations: [
      'grupo',
      'grupo.curso',
      'grupo.docente',
    ],
  });
}
async obtenerUnoCursoAlumno(idCurso: number, idAlumno: number) {
  return this.cursoRepository
    .createQueryBuilder('curso')

    // VALIDAR MATRÍCULA
    .innerJoin('curso.grupos', 'grupo')
    .innerJoin('grupo.matriculas', 'matricula')
    .innerJoin('matricula.alumno', 'alumno')

    // ESTRUCTURA DEL CURSO
    .leftJoinAndSelect('curso.modulos', 'modulo')
    .leftJoinAndSelect('modulo.lecciones', 'leccion')
    .leftJoinAndSelect('leccion.materiales', 'material')

    // 🔥 AQUÍ ESTÁ LA CLAVE
    .leftJoinAndSelect('leccion.examenes', 'examen')

    // 🔥 PREGUNTAS
    .leftJoinAndSelect('examen.preguntas', 'pregunta')

    // 🔥 OPCIONES
    .leftJoinAndSelect('pregunta.opciones', 'opcion')

    // FILTRO
    .where('curso.id = :idCurso', { idCurso })
    .andWhere('alumno.id = :idAlumno', { idAlumno })

    .getOne();
}

  async remove(id: number) {
    await this.cursoRepository.update(id, { estado: false });
    return { message: 'Curso inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.cursoRepository.update(id, { estado: true });
    return { message: 'Curso habilitado correctamente' };
  }

  async create(data: Partial<Curso>){
    const nuevoCurso = this.cursoRepository.create(data);
    return this.cursoRepository.save(nuevoCurso);
  }

  async update(id: number, data: Partial<Curso>) {
    await this.cursoRepository.update(id, data);
    return this.obtenerUno(id);
  }
}
