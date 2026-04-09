import { Test, TestingModule } from '@nestjs/testing';
import { DocenteCursoAdicionalService } from './docente-curso-adicional.service';

describe('DocenteCursoAdicionalService', () => {
  let service: DocenteCursoAdicionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocenteCursoAdicionalService],
    }).compile();

    service = module.get<DocenteCursoAdicionalService>(DocenteCursoAdicionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
