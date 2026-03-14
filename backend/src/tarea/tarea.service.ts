import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarea } from './entities/tarea.entity';

@Injectable()
export class TareaService {

  constructor(
    @InjectRepository(Tarea)
    private tareaRepository: Repository<Tarea>,
  ) {}

 async obtenerPorCurso(idcurso: number) {

  return this.tareaRepository
    .createQueryBuilder('p')
    .where('p.idcurso = :idcurso', { idcurso })
    .orderBy('p.fecha_limite', 'ASC')
    .getMany();

}

}