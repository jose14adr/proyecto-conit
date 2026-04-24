import { Test, TestingModule } from '@nestjs/testing';
import { ExamenIntentoController } from './examen_intento.controller';

describe('ExamenIntentoController', () => {
  let controller: ExamenIntentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamenIntentoController],
    }).compile();

    controller = module.get<ExamenIntentoController>(ExamenIntentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
