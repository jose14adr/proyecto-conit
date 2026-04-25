import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionVivo } from './entities/sesion-vivo.entity';
import { Curso } from '../curso/entities/curso.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { EmpresaService } from '../empresa/empresa.service';
import { MeetingProviderFactory } from '../meeting/meeting-provider.factory';
import {
  CreateMeetingInput,
  MeetingProvider,
} from '../meeting/meeting-provider.interface';
import { SesionVivoResponseDto } from './dto/sesion-vivo-response.dto';

@Injectable()
export class SesionVivoService {
  constructor(
    @InjectRepository(SesionVivo)
    private readonly sesionVivoRepository: Repository<SesionVivo>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,

    private readonly empresaService: EmpresaService,
    private readonly meetingProviderFactory: MeetingProviderFactory,
  ) {}

  private toResponseDto(sesion: SesionVivo): SesionVivoResponseDto {
    return {
      id: sesion.id,
      curso: sesion.curso ? { id: (sesion.curso as any).id } : null,
      titulo: sesion.titulo,
      descripcion: sesion.descripcion,
      fecha: sesion.fecha,
      duracion: sesion.duracion,
      link_reunion: sesion.link_reunion,
      provider: sesion.provider,
      external_meeting_id: sesion.external_meeting_id,
      estado: sesion.estado,
      idgrupo: sesion.idgrupo ?? null,
    };
  }

  private providerToLabel(provider?: string): string {
    const value = String(provider || 'google').toLowerCase().trim();

    if (value === 'google') return 'Google Meet';
    if (value === 'zoom') return 'Zoom';
    if (value === 'teams') return 'Microsoft Teams';

    return 'Google Meet';
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

  private async obtenerGrupoConCurso(idgrupo: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({
      where: { id: Number(idgrupo) },
      relations: ['curso', 'curso.empresa'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    return grupo;
  }

  private async obtenerProviderDesdeGrupo(
    idgrupo: number,
  ): Promise<MeetingProvider> {
    const grupo = await this.obtenerGrupoConCurso(Number(idgrupo));
    const curso = (grupo as any).curso;

    if (!curso) {
      throw new NotFoundException('El grupo no tiene curso asociado');
    }

    if (curso.empresa?.meetingProvider) {
      return this.normalizarProvider(curso.empresa.meetingProvider);
    }

    if (curso.idempresa) {
      const provider = await this.empresaService.getMeetingProvider(
        Number(curso.idempresa),
      );
      return this.normalizarProvider(provider);
    }

    return 'google';
  }

  async obtenerSesiones(): Promise<SesionVivoResponseDto[]> {
    const sesiones = await this.sesionVivoRepository.find({
      relations: ['curso'],
      order: { fecha: 'ASC' },
    });

    return sesiones.map((sesion) => this.toResponseDto(sesion));
  }

  async obtenerSesionesPorGrupo(
    idgrupo: number,
  ): Promise<SesionVivoResponseDto[]> {
    const sesiones = await this.sesionVivoRepository.find({
      where: {
        idgrupo: Number(idgrupo),
      } as any,
      relations: ['curso'],
      order: { fecha: 'ASC' },
    });

    return sesiones.map((sesion) => this.toResponseDto(sesion));
  }

  async obtenerProviderInfoPorGrupo(idgrupo: number) {
    const provider = await this.obtenerProviderDesdeGrupo(Number(idgrupo));

    return {
      provider,
      label: this.providerToLabel(provider),
    };
  }

  async crearSesion(payload: {
    idgrupo: number;
    titulo: string;
    descripcion?: string;
    fecha: string;
    duracion: number;
  }): Promise<SesionVivoResponseDto> {
    if (!payload.idgrupo) {
      throw new BadRequestException('Falta idgrupo');
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

    const grupo = await this.obtenerGrupoConCurso(Number(payload.idgrupo));
    const curso = (grupo as any).curso;

    if (!curso?.id) {
      throw new NotFoundException('No se pudo resolver el curso del grupo');
    }

    const provider = await this.obtenerProviderDesdeGrupo(Number(payload.idgrupo));
    const providerService = this.meetingProviderFactory.getProvider(provider);

    const meetingInput: CreateMeetingInput = {
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion?.trim() || '',
      fechaInicioIso: fechaInicio.toISOString(),
      fechaFinIso: fechaFin.toISOString(),
    };

    const meeting = await providerService.createMeeting(meetingInput);

    const sesion: SesionVivo = {
      ...new SesionVivo(),
      curso: { id: Number(curso.id) } as any,
      idgrupo: Number(payload.idgrupo),
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
    };

    const guardada: SesionVivo = await this.sesionVivoRepository.save(sesion);
    return this.toResponseDto(guardada);
  }
}
