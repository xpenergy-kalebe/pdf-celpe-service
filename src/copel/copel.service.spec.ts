import { Test, TestingModule } from '@nestjs/testing';
import { CopelService } from './copel.service';

describe('CopelService', () => {
  let service: CopelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CopelService],
    }).compile();

    service = module.get<CopelService>(CopelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
