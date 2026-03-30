import { Test, TestingModule } from '@nestjs/testing';
import { CursoModuloService } from './curso_modulo.service';

describe('CursoModuloService', () => {
  let service: CursoModuloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursoModuloService],
    }).compile();

    service = module.get<CursoModuloService>(CursoModuloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
