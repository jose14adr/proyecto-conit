import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async findOne(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  async getMeetingProvider(id: number): Promise<string> {
    const empresa = await this.findOne(id);
    return empresa.meetingProvider || 'google';
  }
}