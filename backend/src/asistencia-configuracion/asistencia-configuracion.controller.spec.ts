import { Test, TestingModule } from '@nestjs/testing';
import { AsistenciaConfiguracionController } from './asistencia-configuracion.controller';

describe('AsistenciaConfiguracionController', () => {
  let controller: AsistenciaConfiguracionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsistenciaConfiguracionController],
    }).compile();

    controller = module.get<AsistenciaConfiguracionController>(AsistenciaConfiguracionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
