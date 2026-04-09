import { Test, TestingModule } from '@nestjs/testing';
import { DocenteCursoAdicionalController } from './docente-curso-adicional.controller';
import { DocenteCursoAdicionalService } from './docente-curso-adicional.service';

describe('DocenteCursoAdicionalController', () => {
  let controller: DocenteCursoAdicionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocenteCursoAdicionalController],
      providers: [DocenteCursoAdicionalService],
    }).compile();

    controller = module.get<DocenteCursoAdicionalController>(DocenteCursoAdicionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
