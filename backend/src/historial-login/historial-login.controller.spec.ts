import { Test, TestingModule } from '@nestjs/testing';
import { HistorialLoginController } from './historial-login.controller';
import { HistorialLoginService } from './historial-login.service';

describe('HistorialLoginController', () => {
  let controller: HistorialLoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialLoginController],
      providers: [HistorialLoginService],
    }).compile();

    controller = module.get<HistorialLoginController>(HistorialLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
