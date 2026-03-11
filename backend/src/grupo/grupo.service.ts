import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Grupo } from "./entities/grupo.entity";

@Injectable()
export class GrupoService {

  constructor(
    @InjectRepository(Grupo)
    private grupoRepo: Repository<Grupo>,
  ) {}

  async gruposPorCurso(idcurso: number) {
    return this.grupoRepo.find({
      where: {
        curso: {
          id: idcurso
        }
      },
      relations: ["curso", "docente"]
    });
  }

}
