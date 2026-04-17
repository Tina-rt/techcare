import { Controller } from '@nestjs/common';
import { InventoryManagerService } from './inventory-manager.service';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';

@Controller()
export class InventoryManagerController {
  constructor(
    private readonly inventoryManagerService: InventoryManagerService,
  ) {}

  @MessagePattern('get_stock')
  getStock(@Payload() productId: string) {
    return this.inventoryManagerService.getStock(productId);
  }

  @MessagePattern('update_stock')
  updateStock(@Payload() payload: { productId: string; quantity: number }) {
    return this.inventoryManagerService.updateStock(
      payload.productId,
      payload.quantity,
    );
  }

  @MessagePattern('find_all_inventory')
  findAllInventory() {
    return this.inventoryManagerService.getAllInventory();
  }

  @EventPattern('product_created')
  handleProductCreated(@Payload() data: { productId: string; quantity: number }) {
    console.log('[Inventory Manager] Initializing stock for product:', data.productId);
    return this.inventoryManagerService.updateStock(data.productId, data.quantity);
  }

  @EventPattern('product_validated')
  handleProductValidated(@Payload() data: any) {
    return this.inventoryManagerService.reserveStock(data);
  }

  @EventPattern('payment_failed')
  handlePaymentFailed(@Payload() data: any) {
    return this.inventoryManagerService.releaseStock(data);
  }
}
