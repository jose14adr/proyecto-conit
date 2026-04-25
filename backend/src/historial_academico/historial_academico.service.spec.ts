import { Test, TestingModule } from '@nestjs/testing';
import { HistorialAcademicoService } from './historial_academico.service';

describe('HistorialAcademicoService', () => {
  let service: HistorialAcademicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistorialAcademicoService],
    }).compile();

    service = module.get<HistorialAcademicoService>(HistorialAcademicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
