import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Soporte } from './entities/soporte.entity';
import { SoporteAdjunto } from './entities/soporte-adjunto.entity';

@Injectable()
export class SoporteService {
  constructor(
    @InjectRepository(Soporte)
    private readonly soporteRepository: Repository<Soporte>,

    @InjectRepository(SoporteAdjunto)
    private readonly soporteAdjuntoRepository: Repository<SoporteAdjunto>,
  ) {}

  async create(data: any) {
    const ticket = this.soporteRepository.create({
      asunto: data.asunto,
      mensaje: data.mensaje,
      estado: data.estado || 'PENDIENTE',
      prioridad: data.prioridad || 'MEDIA',
      idalumno: data.idalumno ?? null,
      idusuario: data.idusuario ?? null,
      idadministrador: data.idadministrador ?? null,
      respuesta: data.respuesta ?? null,
    });

    const soporteGuardado = await this.soporteRepository.save(ticket);

    if (Array.isArray(data.adjuntos) && data.adjuntos.length > 0) {
      const adjuntos = data.adjuntos.map((adjunto: any) =>
        this.soporteAdjuntoRepository.create({
          idsoporte: soporteGuardado.id,
          nombre_archivo: adjunto.nombre_archivo,
          archivo_url: adjunto.archivo_url,
          tipo_mime: adjunto.tipo_mime || null,
          tamano: adjunto.tamano || null,
        }),
      );

      await this.soporteAdjuntoRepository.save(adjuntos);
    }

    return this.findOne(soporteGuardado.id);
  }

  async findAll() {
    const tickets = await this.soporteRepository.find({
      order: { created_at: 'DESC' },
    });

    return this.attachAdjuntos(tickets);
  }

  async findByAlumno(idalumno: number) {
    const tickets = await this.soporteRepository.find({
      where: { idalumno },
      order: { created_at: 'DESC' },
    });

    return this.attachAdjuntos(tickets);
  }

  async findOne(id: number) {
    const ticket = await this.soporteRepository.findOne({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket de soporte no encontrado');
    }

    const adjuntos = await this.soporteAdjuntoRepository.find({
      where: { idsoporte: id },
      order: { created_at: 'ASC' },
    });

    return {
      ...ticket,
      adjuntos,
    };
  }

  async update(id: number, data: any) {
    const ticket = await this.soporteRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket de soporte no encontrado');
    }

    await this.soporteRepository.update(id, {
      asunto: data.asunto ?? ticket.asunto,
      mensaje: data.mensaje ?? ticket.mensaje,
      estado: data.estado ?? ticket.estado,
      prioridad: data.prioridad ?? ticket.prioridad,
      idadministrador: data.idadministrador ?? ticket.idadministrador,
      respuesta: data.respuesta ?? ticket.respuesta,
      updated_at: new Date(),
    });

    return this.findOne(id);
  }

  async addAdjuntos(idsoporte: number, adjuntos: any[]) {
    const ticket = await this.soporteRepository.findOne({
      where: { id: idsoporte },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket de soporte no encontrado');
    }

    const nuevosAdjuntos = adjuntos.map((adjunto) =>
      this.soporteAdjuntoRepository.create({
        idsoporte,
        nombre_archivo: adjunto.nombre_archivo,
        archivo_url: adjunto.archivo_url,
        tipo_mime: adjunto.tipo_mime || null,
        tamano: adjunto.tamano || null,
      }),
    );

    await this.soporteAdjuntoRepository.save(nuevosAdjuntos);

    return this.findOne(idsoporte);
  }

  async remove(id: number) {
    const ticket = await this.soporteRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket de soporte no encontrado');
    }

    await this.soporteRepository.delete(id);
    return { message: 'Ticket eliminado correctamente' };
  }

  private async attachAdjuntos(tickets: Soporte[]) {
    if (!tickets.length) return [];

    const ids = tickets.map((t) => t.id);

    const adjuntos = await this.soporteAdjuntoRepository.find({
      where: { idsoporte: In(ids) },
      order: { created_at: 'ASC' },
    });

    return tickets.map((ticket) => ({
      ...ticket,
      adjuntos: adjuntos.filter((a) => a.idsoporte === ticket.id),
    }));
  }
}