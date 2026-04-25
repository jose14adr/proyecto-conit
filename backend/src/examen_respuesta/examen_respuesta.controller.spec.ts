import { Test, TestingModule } from '@nestjs/testing';
import { ExamenRespuestaController } from './examen_respuesta.controller';

describe('ExamenRespuestaController', () => {
  let controller: ExamenRespuestaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamenRespuestaController],
    }).compile();

    controller = module.get<ExamenRespuestaController>(ExamenRespuestaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
