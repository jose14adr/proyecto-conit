import { Test, TestingModule } from '@nestjs/testing';
import { LeccionMaterialController } from './leccion-material.controller';

describe('LeccionMaterialController', () => {
  let controller: LeccionMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeccionMaterialController],
    }).compile();

    controller = module.get<LeccionMaterialController>(LeccionMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
