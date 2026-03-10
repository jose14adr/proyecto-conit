import { Test, TestingModule } from '@nestjs/testing';
import { EntregaController } from './entrega.controller';

describe('EntregaController', () => {
  let controller: EntregaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntregaController],
    }).compile();

    controller = module.get<EntregaController>(EntregaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
