import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstiloColor } from './entities/estilo-color.entity';
import { EstiloConfiguracion } from './entities/estilo-configuracion.entity';
import { ActualizarEstiloConfiguracionDto } from './dto/actualizar-estilo-configuracion.dto';
import { CrearEstiloColorDto } from './dto/crear-estilo-color.dto';

@Injectable()
export class EstilosService {
  constructor(
    @InjectRepository(EstiloColor)
    private readonly colorRepo: Repository<EstiloColor>,

    @InjectRepository(EstiloConfiguracion)
    private readonly configRepo: Repository<EstiloConfiguracion>,
  ) {}

  async listarColores() {
    return this.colorRepo.find({
      where: { activo: true },
      order: { orden: 'ASC', id: 'ASC' },
    });
  }

  async crearColor(dto: CrearEstiloColorDto) {
    const hex = this.normalizarHex(dto.hex);

    const colorExiste = await this.colorRepo.findOne({
      where: { hex },
    });

    if (colorExiste) {
      throw new BadRequestException('Ya existe un color con ese HEX');
    }

    const nuevoColor = this.colorRepo.create({
      nombre: dto.nombre,
      hex,
      hue: dto.hue ?? null,
      saturation: dto.saturation ?? null,
      value: dto.value ?? null,
      activo: dto.activo ?? true,
      orden: dto.orden ?? 1,
    });

    return this.colorRepo.save(nuevoColor);
  }

  async obtenerConfiguracionAdmin() {
    const config = await this.obtenerOcrearConfiguracion();

    return {
      config,
      resuelto: this.resolverConfiguracion(config),
    };
  }

  async obtenerConfiguracionPublica() {
    const config = await this.obtenerOcrearConfiguracion();
    return this.resolverConfiguracion(config);
  }

  async actualizarConfiguracion(dto: ActualizarEstiloConfiguracionDto) {
    const config = await this.obtenerOcrearConfiguracion();

    if (dto.tipoSidenav !== undefined) {
      const tiposPermitidos = ['OSCURO', 'TRANSPARENTE', 'BLANCO'];

      if (!tiposPermitidos.includes(dto.tipoSidenav)) {
        throw new BadRequestException('Tipo de sidenav inválido');
      }

      config.tipoSidenav = dto.tipoSidenav;
    }

    if (dto.sidenavMini !== undefined) {
      config.sidenavMini = dto.sidenavMini;
    }

    if (dto.modoOscuro !== undefined) {
      config.modoOscuro = dto.modoOscuro;
    }

    if (dto.botonPrimarioUsaSidenav !== undefined) {
      config.botonPrimarioUsaSidenav = dto.botonPrimarioUsaSidenav;
    }

    if (dto.botonSecundarioUsaSidenav !== undefined) {
      config.botonSecundarioUsaSidenav = dto.botonSecundarioUsaSidenav;
    }

    if (dto.colorPrincipalId !== undefined) {
      config.colorPrincipal = await this.obtenerColorONull(dto.colorPrincipalId);

      if (dto.colorPrincipalId !== null) {
        config.colorPrincipalCustom = null;
      }
    }

    if (dto.colorSecundarioId !== undefined) {
      config.colorSecundario = await this.obtenerColorONull(dto.colorSecundarioId);

      if (dto.colorSecundarioId !== null) {
        config.colorSecundarioCustom = null;
      }
    }

    if (dto.colorSidenavId !== undefined) {
      config.colorSidenav = await this.obtenerColorONull(dto.colorSidenavId);

      if (dto.colorSidenavId !== null) {
        config.colorSidenavCustom = null;
      }
    }

    if (dto.botonPrimarioColorId !== undefined) {
      config.botonPrimarioColor = await this.obtenerColorONull(dto.botonPrimarioColorId);

      if (dto.botonPrimarioColorId !== null) {
        config.botonPrimarioCustom = null;
      }
    }

    if (dto.botonSecundarioColorId !== undefined) {
      config.botonSecundarioColor = await this.obtenerColorONull(dto.botonSecundarioColorId);

      if (dto.botonSecundarioColorId !== null) {
        config.botonSecundarioCustom = null;
      }
    }

    if (dto.colorPrincipalCustom !== undefined) {
      config.colorPrincipalCustom = this.normalizarHexONull(dto.colorPrincipalCustom);

      if (config.colorPrincipalCustom) {
        config.colorPrincipal = null;
      }
    }

    if (dto.colorSecundarioCustom !== undefined) {
      config.colorSecundarioCustom = this.normalizarHexONull(dto.colorSecundarioCustom);

      if (config.colorSecundarioCustom) {
        config.colorSecundario = null;
      }
    }

    if (dto.colorSidenavCustom !== undefined) {
      config.colorSidenavCustom = this.normalizarHexONull(dto.colorSidenavCustom);

      if (config.colorSidenavCustom) {
        config.colorSidenav = null;
      }
    }

    if (dto.botonPrimarioCustom !== undefined) {
      config.botonPrimarioCustom = this.normalizarHexONull(dto.botonPrimarioCustom);

      if (config.botonPrimarioCustom) {
        config.botonPrimarioColor = null;
      }
    }

    if (dto.botonSecundarioCustom !== undefined) {
      config.botonSecundarioCustom = this.normalizarHexONull(dto.botonSecundarioCustom);

      if (config.botonSecundarioCustom) {
        config.botonSecundarioColor = null;
      }
    }

    config.actualizadoEn = new Date();

    await this.configRepo.save(config);

    return this.obtenerConfiguracionAdmin();
  }

  private async obtenerOcrearConfiguracion() {
    let config = await this.configRepo.findOne({
      where: { id: 1 },
      relations: [
        'colorPrincipal',
        'colorSecundario',
        'colorSidenav',
        'botonPrimarioColor',
        'botonSecundarioColor',
      ],
    });

    if (!config) {
      const colorPrincipal = await this.colorRepo.findOne({ where: { hex: '#3B82F6' } });
      const colorSecundario = await this.colorRepo.findOne({ where: { hex: '#0EA5E9' } });
      const colorSidenav = await this.colorRepo.findOne({ where: { hex: '#1E293B' } });

      config = this.configRepo.create({
        id: 1,
        colorPrincipal: colorPrincipal ?? null,
        colorSecundario: colorSecundario ?? null,
        colorSidenav: colorSidenav ?? null,
        colorPrincipalCustom: null,
        colorSecundarioCustom: null,
        colorSidenavCustom: null,
        botonPrimarioUsaSidenav: true,
        botonSecundarioUsaSidenav: true,
        botonPrimarioColor: null,
        botonSecundarioColor: null,
        botonPrimarioCustom: null,
        botonSecundarioCustom: null,
        tipoSidenav: 'OSCURO',
        sidenavMini: false,
        modoOscuro: false,
      });

      await this.configRepo.save(config);

      config = await this.configRepo.findOne({
        where: { id: 1 },
        relations: [
          'colorPrincipal',
          'colorSecundario',
          'colorSidenav',
          'botonPrimarioColor',
          'botonSecundarioColor',
        ],
      });
    }

    if (!config) {
      throw new NotFoundException('No se pudo obtener la configuración de estilos');
    }

    return config;
  }

  private async obtenerColorONull(id?: number | null) {
    if (id === null || id === undefined) {
      return null;
    }

    const color = await this.colorRepo.findOne({
      where: { id, activo: true },
    });

    if (!color) {
      throw new NotFoundException(`No existe el color con ID ${id}`);
    }

    return color;
  }

  private resolverConfiguracion(config: EstiloConfiguracion) {
    const primary = config.colorPrincipalCustom || config.colorPrincipal?.hex || '#3B82F6';
    const secondary = config.colorSecundarioCustom || config.colorSecundario?.hex || '#0EA5E9';
    const sidenav = config.colorSidenavCustom || config.colorSidenav?.hex || '#1E293B';

    const buttonPrimary = config.botonPrimarioUsaSidenav
      ? sidenav
      : config.botonPrimarioCustom || config.botonPrimarioColor?.hex || primary;

    const buttonSecondary = config.botonSecundarioUsaSidenav
      ? sidenav
      : config.botonSecundarioCustom || config.botonSecundarioColor?.hex || secondary;

    const background = config.modoOscuro ? '#0F172A' : '#F8FAFC';
    const card = config.modoOscuro ? '#1E293B' : '#FFFFFF';
    const text = config.modoOscuro ? '#F8FAFC' : '#0F172A';
    const mutedText = config.modoOscuro ? '#CBD5E1' : '#64748B';
    const border = config.modoOscuro ? '#334155' : '#E2E8F0';

    return {
      primary,
      secondary,
      sidenav,
      sidenavText: this.obtenerColorTextoContraste(sidenav),
      buttonPrimary,
      buttonPrimaryText: this.obtenerColorTextoContraste(buttonPrimary),
      buttonSecondary,
      buttonSecondaryText: this.obtenerColorTextoContraste(buttonSecondary),
      background,
      card,
      text,
      mutedText,
      border,
      tipoSidenav: config.tipoSidenav,
      sidenavMini: config.sidenavMini,
      modoOscuro: config.modoOscuro,
      actualizadoEn: config.actualizadoEn,
    };
  }

  private normalizarHexONull(valor?: string | null) {
    if (valor === null || valor === undefined || valor.trim() === '') {
      return null;
    }

    return this.normalizarHex(valor);
  }

  private normalizarHex(valor: string) {
    const hex = valor.trim().toUpperCase();

    if (!/^#[0-9A-F]{6}$/.test(hex)) {
      throw new BadRequestException('El color debe tener formato HEX. Ejemplo: #3B82F6');
    }

    return hex;
  }

  private obtenerColorTextoContraste(hex: string) {
    const limpio = hex.replace('#', '');

    const r = parseInt(limpio.substring(0, 2), 16);
    const g = parseInt(limpio.substring(2, 4), 16);
    const b = parseInt(limpio.substring(4, 6), 16);

    const brillo = (r * 299 + g * 587 + b * 114) / 1000;

    return brillo > 150 ? '#0F172A' : '#FFFFFF';
  }
}