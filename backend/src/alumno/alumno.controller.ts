import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { Alumno } from './entities/alumno.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { CreateAlumnoDto } from './dto/create-alumno.dto'; // Importa tu DTO (ajusta la ruta si es necesario)

@Controller('alumno')
@UseGuards(JwtAuthGuard)
export class AlumnoController {
  constructor(private readonly alumnoService: AlumnoService) {}

  @Post()
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnoService.create(createAlumnoDto);
    }
  @Get('perfil')
  getPerfil(@Req() req) {
    return this.alumnoService.getPerfil(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Alumno>) {
    return this.alumnoService.update(+id, body);
  }

  @Get()
  findAll() {
    return this.alumnoService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.remove(id);
  }

  @Patch(':id/habilitar')
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.habilitar(id);
  }

}
