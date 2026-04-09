import { Test, TestingModule } from '@nestjs/testing';
import { ExamenPreguntaController } from './examen_pregunta.controller';

describe('ExamenPreguntaController', () => {
  let controller: ExamenPreguntaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamenPreguntaController],
    }).compile();

    controller = module.get<ExamenPreguntaController>(ExamenPreguntaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
