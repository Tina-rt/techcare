import { Module } from '@nestjs/common';
import { InventoryManagerController } from './inventory-manager.controller';
import { InventoryManagerService } from './inventory-manager.service';

@Module({
  imports: [],
  controllers: [InventoryManagerController],
  providers: [InventoryManagerService],
})
export class InventoryManagerModule {}
