import { Test, TestingModule } from '@nestjs/testing';
import { OpeningsService } from './openings.service';

describe('OpeningsService', () => {
  let service: OpeningsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpeningsService],
    }).compile();

    service = module.get<OpeningsService>(OpeningsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
