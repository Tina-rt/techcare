import { Test, TestingModule } from '@nestjs/testing';
import { ProductManagerController } from './product-manager.controller';
import { ProductManagerService } from './product-manager.service';

describe('ProductManagerController', () => {
  let ProductManagerController: ProductManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductManagerController],
      providers: [ProductManagerService],
    }).compile();

    ProductManagerController = app.get<ProductManagerController>(
      ProductManagerController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ProductManagerController.getHello()).toBe('Hello World!');
    });
  });
});
