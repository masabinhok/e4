import { Test, TestingModule } from '@nestjs/testing';
import { OpeningsController } from './openings.controller';
import { OpeningsService } from './openings.service';

describe('OpeningsController', () => {
  let controller: OpeningsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpeningsController],
      providers: [OpeningsService],
    }).compile();

    controller = module.get<OpeningsController>(OpeningsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
