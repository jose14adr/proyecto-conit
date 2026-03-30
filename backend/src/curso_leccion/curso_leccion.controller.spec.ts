import { Test, TestingModule } from '@nestjs/testing';
import { CursoLeccionController } from './curso_leccion.controller';

describe('CursoLeccionController', () => {
  let controller: CursoLeccionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CursoLeccionController],
    }).compile();

    controller = module.get<CursoLeccionController>(CursoLeccionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
