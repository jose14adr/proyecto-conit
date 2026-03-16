import { Test, TestingModule } from '@nestjs/testing';
import { SesionVivoController } from './sesion-vivo.controller';

describe('SesionVivoController', () => {
  let controller: SesionVivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SesionVivoController],
    }).compile();

    controller = module.get<SesionVivoController>(SesionVivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
