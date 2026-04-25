import { Test, TestingModule } from '@nestjs/testing';
import { ExamenRespuestaService } from './examen_respuesta.service';

describe('ExamenRespuestaService', () => {
  let service: ExamenRespuestaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamenRespuestaService],
    }).compile();

    service = module.get<ExamenRespuestaService>(ExamenRespuestaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
