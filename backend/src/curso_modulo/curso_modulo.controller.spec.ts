import { Test, TestingModule } from '@nestjs/testing';
import { CursoModuloController } from './curso_modulo.controller';

describe('CursoModuloController', () => {
  let controller: CursoModuloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CursoModuloController],
    }).compile();

    controller = module.get<CursoModuloController>(CursoModuloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
