import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EntregasVideo } from './entities/entregas-video.entity'

@Injectable()
export class EntregasVideoService {

  constructor(
    @InjectRepository(EntregasVideo)
    private repo: Repository<EntregasVideo>
  ) {}

  async crear(data:any){
    const nueva = this.repo.create(data)
    return await this.repo.save(nueva)
  }

  async obtener(curso_id:number){
    return await this.repo.findOne({
      where: { curso_id }
    })
  }

  async actualizar(id:number, data:any){
    await this.repo.update(id, data)
    return this.repo.findOne({ where: { id } })
  }

  async eliminar(id:number){
    await this.repo.delete(id)
    return { ok: true }
  }

}