import { Test, TestingModule } from '@nestjs/testing';
import { HistorialLoginService } from './historial-login.service';

describe('HistorialLoginService', () => {
  let service: HistorialLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistorialLoginService],
    }).compile();

    service = module.get<HistorialLoginService>(HistorialLoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
