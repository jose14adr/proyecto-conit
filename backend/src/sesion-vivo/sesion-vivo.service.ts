import { Injectable, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionVivo } from './entities/sesion-vivo.entity';
import { GoogleMeetService } from '../google-meet/google-meet.service';

@Injectable()
export class SesionVivoService {
  constructor(
    @InjectRepository(SesionVivo)
    private readonly sesionVivoRepository: Repository<SesionVivo>,

    @Optional()
    private readonly googleMeetService?: GoogleMeetService,
  ) {}

  async obtenerSesiones(): Promise<SesionVivo[]> {
    return this.sesionVivoRepository.find({
      relations: ['curso', 'curso.grupos', 'curso.grupos.docente'],
      order: { fecha: 'ASC' },
    });
  }

  async obtenerSesionesPorCurso(idcurso: number): Promise<SesionVivo[]> {
    return this.sesionVivoRepository.find({
      where: {
        curso: { id: idcurso } as any,
      },
      relations: ['curso'],
      order: { fecha: 'ASC' },
    });
  }

  async crearSesion(payload: {
    idcurso: number;
    titulo: string;
    descripcion?: string;
    fecha: string;
    duracion: number;
  }): Promise<SesionVivo> {
    if (!payload.idcurso) {
      throw new BadRequestException('Falta idcurso');
    }

    if (!payload.titulo?.trim()) {
      throw new BadRequestException('El título es obligatorio');
    }

    if (!payload.fecha) {
      throw new BadRequestException('La fecha es obligatoria');
    }

    if (!payload.duracion || Number(payload.duracion) <= 0) {
      throw new BadRequestException('La duración debe ser mayor a 0');
    }

    const fechaInicio = new Date(payload.fecha);

    if (Number.isNaN(fechaInicio.getTime())) {
      throw new BadRequestException('La fecha no es válida');
    }

    const fechaFin = new Date(
      fechaInicio.getTime() + Number(payload.duracion) * 60 * 1000,
    );

    let link = '';

    try {
      if (this.googleMeetService) {
        const meet = await this.googleMeetService.crearSesionMeet({
          titulo: payload.titulo.trim(),
          descripcion: payload.descripcion?.trim() || '',
          fechaInicioIso: fechaInicio.toISOString(),
          fechaFinIso: fechaFin.toISOString(),
        });

        link = meet?.meetLink || meet?.htmlLink || '';
      }
    } catch (error) {
      console.error('⚠️ Error creando Meet:', error);
    }

    const sesion = this.sesionVivoRepository.create({
      curso: { id: Number(payload.idcurso) } as any,
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion?.trim() || '',
      fecha: fechaInicio,
      duracion: Number(payload.duracion),
      link_reunion: link,
      estado: 'programada',
    });

    return this.sesionVivoRepository.save(sesion);
  }
}