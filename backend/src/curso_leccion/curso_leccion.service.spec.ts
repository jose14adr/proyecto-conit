import { Test, TestingModule } from '@nestjs/testing';
import { CursoLeccionService } from './curso_leccion.service';

describe('CursoLeccionService', () => {
  let service: CursoLeccionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursoLeccionService],
    }).compile();

    service = module.get<CursoLeccionService>(CursoLeccionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
