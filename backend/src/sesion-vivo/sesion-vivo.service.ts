import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SesionVivo } from './entities/sesion-vivo.entity';
import { GoogleMeetService } from '../google-meet/google-meet.service';

@Injectable()
export class SesionVivoService {
  constructor(
    @InjectRepository(SesionVivo)
    private readonly sesionVivoRepository: Repository<SesionVivo>,

    // ⚠️ opcional (para que no rompa si no está bien configurado)
    private readonly googleMeetService: GoogleMeetService,
  ) {}

  async obtenerSesiones(): Promise<SesionVivo[]> {
    return await this.sesionVivoRepository.find({
      relations: ['curso', 'curso.grupos', 'curso.grupos.docente'],
      order: { fecha: 'ASC' },
    });
  }

  async obtenerSesionesPorCurso(idcurso: number): Promise<SesionVivo[]> {
    return await this.sesionVivoRepository.find({
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

  if (!payload.titulo || payload.titulo.trim() === '') {
    throw new BadRequestException('El título es obligatorio');
  }

  if (!payload.fecha) {
    throw new BadRequestException('La fecha es obligatoria');
  }

  if (!payload.duracion || payload.duracion <= 0) {
    throw new BadRequestException('Duración inválida');
  }

  const fechaInicio = new Date(payload.fecha);

  if (isNaN(fechaInicio.getTime())) {
    throw new BadRequestException('Fecha inválida');
  }

  const fechaFin = new Date(
    fechaInicio.getTime() + payload.duracion * 60000,
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
    curso: { id: payload.idcurso } as any,
    titulo: payload.titulo.trim(),
    descripcion: payload.descripcion?.trim() || '', // 🔥 FIX AQUÍ
    fecha: fechaInicio,
    duracion: payload.duracion,
    link_reunion: link,
    estado: 'programada',
  });

  return await this.sesionVivoRepository.save(sesion);
}
}