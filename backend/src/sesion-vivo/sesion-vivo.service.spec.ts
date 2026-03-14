import { Test, TestingModule } from '@nestjs/testing';
import { SesionVivoService } from './sesion-vivo.service';

describe('SesionVivoService', () => {
  let service: SesionVivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SesionVivoService],
    }).compile();

    service = module.get<SesionVivoService>(SesionVivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
