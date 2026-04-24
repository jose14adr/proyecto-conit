import { Test, TestingModule } from '@nestjs/testing';
import { ExamenPreguntaService } from './examen_pregunta.service';

describe('ExamenPreguntaService', () => {
  let service: ExamenPreguntaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamenPreguntaService],
    }).compile();

    service = module.get<ExamenPreguntaService>(ExamenPreguntaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
