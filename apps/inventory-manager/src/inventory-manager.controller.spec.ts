import { Test, TestingModule } from '@nestjs/testing';
import { InventoryManagerController } from './inventory-manager.controller';
import { InventoryManagerService } from './inventory-manager.service';

describe('InventoryManagerController', () => {
  let inventoryManagerController: InventoryManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoryManagerController],
      providers: [InventoryManagerService],
    }).compile();

    inventoryManagerController = app.get<InventoryManagerController>(InventoryManagerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(inventoryManagerController.getHello()).toBe('Hello World!');
    });
  });
});
