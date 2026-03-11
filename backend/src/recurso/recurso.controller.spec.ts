import { Test, TestingModule } from '@nestjs/testing';
import { RecursoController } from './recurso.controller';

describe('RecursoController', () => {
  let controller: RecursoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecursoController],
    }).compile();

    controller = module.get<RecursoController>(RecursoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
