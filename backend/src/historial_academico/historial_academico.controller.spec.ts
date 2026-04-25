import { Test, TestingModule } from '@nestjs/testing';
import { HistorialAcademicoController } from './historial_academico.controller';

describe('HistorialAcademicoController', () => {
  let controller: HistorialAcademicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialAcademicoController],
    }).compile();

    controller = module.get<HistorialAcademicoController>(HistorialAcademicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
