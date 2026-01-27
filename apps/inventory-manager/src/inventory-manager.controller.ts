import { Controller, Get } from '@nestjs/common';
import { InventoryManagerService } from './inventory-manager.service';

@Controller()
export class InventoryManagerController {
  constructor(private readonly inventoryManagerService: InventoryManagerService) {}

  @Get()
  getHello(): string {
    return this.inventoryManagerService.getHello();
  }
}
