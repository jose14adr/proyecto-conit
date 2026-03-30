import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialLoginDto } from './create-historial-login.dto';

export class UpdateHistorialLoginDto extends PartialType(CreateHistorialLoginDto) {}
