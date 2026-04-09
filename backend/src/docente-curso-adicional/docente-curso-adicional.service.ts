import { Injectable } from '@nestjs/common';
import { CreateDocenteCursoAdicionalDto } from './dto/create-docente-curso-adicional.dto';
import { UpdateDocenteCursoAdicionalDto } from './dto/update-docente-curso-adicional.dto';

@Injectable()
export class DocenteCursoAdicionalService {
  create(createDocenteCursoAdicionalDto: CreateDocenteCursoAdicionalDto) {
    return 'This action adds a new docenteCursoAdicional';
  }

  findAll() {
    return `This action returns all docenteCursoAdicional`;
  }

  findOne(id: number) {
    return `This action returns a #${id} docenteCursoAdicional`;
  }

  update(id: number, updateDocenteCursoAdicionalDto: UpdateDocenteCursoAdicionalDto) {
    return `This action updates a #${id} docenteCursoAdicional`;
  }

  remove(id: number) {
    return `This action removes a #${id} docenteCursoAdicional`;
  }
}
