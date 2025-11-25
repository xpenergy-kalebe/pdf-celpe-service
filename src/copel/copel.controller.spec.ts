import { Test, TestingModule } from '@nestjs/testing';
import { CopelController } from './copel.controller';

describe('CopelController', () => {
  let controller: CopelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CopelController],
    }).compile();

    controller = module.get<CopelController>(CopelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
