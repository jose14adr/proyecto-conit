import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialLogin } from './entities/historial-login.entity';

@Injectable()
export class HistorialLoginService {
  constructor(
    @InjectRepository(HistorialLogin)
    private readonly historialRepository: Repository<HistorialLogin>,
  ) {}

  async findAll() {
    const historiales = await this.historialRepository.find({
      relations: ['usuario'],
      order: { fecha_hora: 'DESC' },
    });

    return historiales.map((registro) => {
      const ua = registro.dispositivo || '';
      let navegador = 'Web';
      if (ua.includes('Edge')) {
        navegador = 'Edge';
      } else if (ua.includes('OPR') || ua.includes('Opera')) {
        navegador = 'Opera';
      } else if (ua.includes('Chrome')) {
        navegador = 'Chrome';
      } else if (ua.includes('Safari')) {
        navegador = 'Safari';
      } else if (ua.includes('Firefox')) {
        navegador = 'Firefox';
      }

      let so = 'Desconocido';
      if (ua.includes('Windows')) so = 'Windows';
      else if (ua.includes('Mac OS')) so = 'Mac OS';
      else if (ua.includes('Linux')) so = 'Linux';
      else if (ua.includes('Android')) so = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) so = 'iOS';

      const dispositivoLimpio = `${so} / ${navegador}`;

      let fechaLocal = 'Fecha desconocida';
      if (registro.fecha_hora) {
        const fechaDb = new Date(registro.fecha_hora);
        fechaDb.setHours(fechaDb.getHours() - 5); //Ajuste para UTC-5
        fechaLocal = fechaDb.toLocaleString('es-PE');
      }

      return {
        id: registro.id,
        ip: registro.ip,
        dispositivo: dispositivoLimpio,
        ubicacion: registro.ubicacion || 'Desconocido',
        estado: registro.estado,
        fecha: fechaLocal,
        usuario: {
          nombre: 'Usuario del Sistema',
          correo: registro.usuario?.correo,
          rol: registro.usuario?.rol,
        },
      };
    });
  }

  async registrarIngreso(usuarioId: number, ip: string, dispositivo: string) {
    let ubicacion = 'Desconocida';

    if (ip && ip !== '::1' && ip !== '127.0.0.1') {
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        ubicacion = `${data.city}, ${data.country}`;
      } catch (error) {
        console.error('Error al obtener la ubicación:', error);
      }
    } else {
      ubicacion = 'Red local';
    }

    const nuevoRegistro = this.historialRepository.create({
      usuario: { id: usuarioId },
      ip,
      dispositivo,
      ubicacion,
      estado: 'ACTIVO',
    });
    return await this.historialRepository.save(nuevoRegistro);
  }
}
