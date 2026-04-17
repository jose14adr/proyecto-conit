import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlumnoMaterialProgreso } from './entities/alumno-material-progreso.entity';
import { ReportarProgresoMaterialDto } from './dto/reportar-progreso-material.dto';

@Injectable()
export class AlumnoMaterialProgresoService {
  constructor(
    @InjectRepository(AlumnoMaterialProgreso)
    private readonly repo: Repository<AlumnoMaterialProgreso>,
  ) {}

  async obtenerUno(idmatricula: number, idmaterial: number) {
    return this.repo.findOne({
      where: { idmatricula, idmaterial },
    });
  }

  async listarPorMatricula(idmatricula: number) {
    return this.repo.find({
      where: { idmatricula },
      order: { updated_at: 'DESC' },
    });
  }

  async reportar(dto: ReportarProgresoMaterialDto) {
    let registro = await this.repo.findOne({
      where: {
        idmatricula: dto.idmatricula,
        idmaterial: dto.idmaterial,
      },
    });

    if (!registro) {
      registro = this.repo.create({
        idmatricula: dto.idmatricula,
        idmaterial: dto.idmaterial,
        fecha_inicio: new Date(),
        fecha_ultimo_evento: new Date(),
        ultimo_segundo_reportado: 0,
        max_segundo_visto: 0,
        duracion_segundos: dto.duracionSegundos || 0,
        porcentaje_visto: 0,
        completado: false,
        fecha_completado: null,
        veces_reproducido: dto.evento === 'play' ? 1 : 0,
      });
    }

    const tolerancia = 10;
    const segundoActual = Number(dto.segundoActual || 0);
    const duracion = Number(dto.duracionSegundos || registro.duracion_segundos || 0);
    const maxAnterior = Number(registro.max_segundo_visto || 0);

    registro.fecha_ultimo_evento = new Date();
    registro.ultimo_segundo_reportado = segundoActual;
    registro.duracion_segundos = duracion > 0 ? duracion : registro.duracion_segundos;

    if (dto.evento === 'play') {
      registro.veces_reproducido = Number(registro.veces_reproducido || 0) + 1;
    }

    const avanceValido = segundoActual <= maxAnterior + tolerancia;

    if (avanceValido && segundoActual > maxAnterior) {
      registro.max_segundo_visto = segundoActual;
    }

    if (dto.evento === 'ended' && duracion > 0) {
      registro.max_segundo_visto = duracion;
    }

    const baseDuracion = Number(registro.duracion_segundos || 0);

    registro.porcentaje_visto =
      baseDuracion > 0
        ? Number(
            ((Number(registro.max_segundo_visto || 0) / baseDuracion) * 100).toFixed(2),
          )
        : 0;

    if (!registro.completado) {
      if (dto.evento === 'ended' || registro.porcentaje_visto >= 80) {
        registro.completado = true;
        registro.fecha_completado = new Date();
      }
    }

    registro.updated_at = new Date();

    return this.repo.save(registro);
  }
}