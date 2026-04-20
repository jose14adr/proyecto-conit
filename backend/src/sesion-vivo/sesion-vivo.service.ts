import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionVivo } from './entities/sesion-vivo.entity';
import { Curso } from '../curso/entities/curso.entity';
import { EmpresaService } from '../empresa/empresa.service';
import { MeetingProviderFactory } from '../meeting/meeting-provider.factory';
import {
  CreateMeetingInput,
  MeetingProvider,
} from '../meeting/meeting-provider.interface';

@Injectable()
export class SesionVivoService {
  constructor(
    @InjectRepository(SesionVivo)
    private readonly sesionVivoRepository: Repository<SesionVivo>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    private readonly empresaService: EmpresaService,
    private readonly meetingProviderFactory: MeetingProviderFactory,
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

  private normalizarProvider(provider?: string): MeetingProvider {
    const valor = String(provider || 'google').toLowerCase().trim();

    if (valor === 'google' || valor === 'zoom' || valor === 'teams') {
      return valor;
    }

    throw new BadRequestException(
      `Proveedor de reuniones no válido: ${provider}`,
    );
  }

  private async obtenerProviderDesdeCurso(idcurso: number): Promise<MeetingProvider> {
    const curso = await this.cursoRepository.findOne({
      where: { id: Number(idcurso) },
      relations: ['empresa'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (curso.empresa?.meetingProvider) {
      return this.normalizarProvider(curso.empresa.meetingProvider);
    }

    if (curso.idempresa) {
      const provider = await this.empresaService.getMeetingProvider(curso.idempresa);
      return this.normalizarProvider(provider);
    }

    return 'google';
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

    const provider = await this.obtenerProviderDesdeCurso(Number(payload.idcurso));

    const providerService = this.meetingProviderFactory.getProvider(provider);

    const meetingInput: CreateMeetingInput = {
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion?.trim() || '',
      fechaInicioIso: fechaInicio.toISOString(),
      fechaFinIso: fechaFin.toISOString(),
    };

    const meeting = await providerService.createMeeting(meetingInput);

    const sesion = this.sesionVivoRepository.create({
      curso: { id: Number(payload.idcurso) } as any,
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion?.trim() || '',
      fecha: fechaInicio,
      duracion: Number(payload.duracion),
      link_reunion: meeting.joinUrl,
      provider: meeting.provider,
      external_meeting_id: meeting.externalMeetingId || null,
      host_url: meeting.hostUrl || null,
      metadata: meeting.metadata || null,
      estado: 'programada',
    });

    return this.sesionVivoRepository.save(sesion);
  }
}