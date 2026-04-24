import { Test, TestingModule } from '@nestjs/testing';
import { ExamenOpcionService } from './examen_opcion.service';

describe('ExamenOpcionService', () => {
  let service: ExamenOpcionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamenOpcionService],
    }).compile();

    service = module.get<ExamenOpcionService>(ExamenOpcionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
