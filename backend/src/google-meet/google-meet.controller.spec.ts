import { Test, TestingModule } from '@nestjs/testing';
import { GoogleMeetController } from './google-meet.controller';

describe('GoogleMeetController', () => {
  let controller: GoogleMeetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleMeetController],
    }).compile();

    controller = module.get<GoogleMeetController>(GoogleMeetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
