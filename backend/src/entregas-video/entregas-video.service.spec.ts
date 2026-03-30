import { Test, TestingModule } from '@nestjs/testing';
import { EntregasVideoService } from './entregas-video.service';

describe('EntregasVideoService', () => {
  let service: EntregasVideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntregasVideoService],
    }).compile();

    service = module.get<EntregasVideoService>(EntregasVideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
