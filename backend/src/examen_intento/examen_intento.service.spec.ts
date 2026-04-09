import { Test, TestingModule } from '@nestjs/testing';
import { ExamenIntentoService } from './examen_intento.service';

describe('ExamenIntentoService', () => {
  let service: ExamenIntentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamenIntentoService],
    }).compile();

    service = module.get<ExamenIntentoService>(ExamenIntentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
