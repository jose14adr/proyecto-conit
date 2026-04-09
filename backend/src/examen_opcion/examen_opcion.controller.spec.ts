import { Test, TestingModule } from '@nestjs/testing';
import { ExamenOpcionController } from './examen_opcion.controller';

describe('ExamenOpcionController', () => {
  let controller: ExamenOpcionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamenOpcionController],
    }).compile();

    controller = module.get<ExamenOpcionController>(ExamenOpcionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
