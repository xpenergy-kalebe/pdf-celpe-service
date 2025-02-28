import { Test, TestingModule } from '@nestjs/testing';
import { CelpeController } from './celpe.controller';

describe('CelpeController', () => {
  let controller: CelpeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CelpeController],
    }).compile();

    controller = module.get<CelpeController>(CelpeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
