import { Test, TestingModule } from '@nestjs/testing';
import { LeccionMaterialService } from './leccion-material.service';

describe('LeccionMaterialService', () => {
  let service: LeccionMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeccionMaterialService],
    }).compile();

    service = module.get<LeccionMaterialService>(LeccionMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
