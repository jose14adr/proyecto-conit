import { Test, TestingModule } from '@nestjs/testing';
import { EntregasVideoController } from './entregas-video.controller';

describe('EntregasVideoController', () => {
  let controller: EntregasVideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntregasVideoController],
    }).compile();

    controller = module.get<EntregasVideoController>(EntregasVideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
