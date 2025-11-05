import { Test, TestingModule } from '@nestjs/testing';
import { ProductManagerController } from './product-manager.controller';
import { ProductManagerService } from './product-manager.service';

describe('ProductManagerController', () => {
  let productManagerController: ProductManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductManagerController],
      providers: [ProductManagerService],
    }).compile();

    productManagerController = app.get<ProductManagerController>(
      ProductManagerController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(productManagerController.getHello()).toBe('Hello World!');
    });
  });
});
