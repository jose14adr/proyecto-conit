import { PartialType } from '@nestjs/mapped-types';
import { CreateDocenteCursoAdicionalDto } from './create-docente-curso-adicional.dto';

export class UpdateDocenteCursoAdicionalDto extends PartialType(
  CreateDocenteCursoAdicionalDto,
) {}
