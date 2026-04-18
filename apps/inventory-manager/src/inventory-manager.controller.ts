import { Controller } from '@nestjs/common';
import { InventoryManagerService } from './inventory-manager.service';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import {
  Inventory,
  UpdateStockDto,
  StockReservationDto,
  StockReleaseDto,
  FinalizeStockPayload,
} from '@app/shared';

@Controller()
export class InventoryManagerController {
  constructor(
    private readonly inventoryManagerService: InventoryManagerService,
  ) {}

  @MessagePattern('get_stock')
  getStock(@Payload() productId: string): Promise<Inventory | undefined> {
    console.log('Received message get_stock', productId);
    return this.inventoryManagerService.getStock(productId);
  }

  @MessagePattern('update_stock')
  updateStock(@Payload() payload: UpdateStockDto): Promise<Inventory[]> {
    return this.inventoryManagerService.updateStock(
      payload.productId,
      payload.quantity,
    );
  }

  @MessagePattern('find_all_inventory')
  findAllInventory(): Promise<Inventory[]> {
    console.log('Received messaage find all inventory');
    return this.inventoryManagerService.getAllInventory();
  }

  @MessagePattern('product_created')
  handleProductCreated(
    @Payload() data: UpdateStockDto,
  ): Promise<Inventory[]> {
    console.log(
      '[Inventory Manager] Initializing stock for product:',
      data.productId,
    );
    return this.inventoryManagerService.updateStock(
      data.productId,
      data.quantity,
    );
  }

  @EventPattern('product_validated')
  handleProductValidated(@Payload() data: StockReservationDto) {
    return this.inventoryManagerService.reserveStock(data);
  }

  @EventPattern('payment_completed')
  handlePaymentCompleted(@Payload() data: FinalizeStockPayload) {
    return this.inventoryManagerService.finalizeStock(data);
  }

  @EventPattern('payment_failed')
  handlePaymentFailed(@Payload() data: StockReleaseDto) {
    return this.inventoryManagerService.releaseStock(data);
  }

  @MessagePattern('get_movements')
  findMovements(@Payload() productId?: string) {
    return this.inventoryManagerService.getMovements(productId);
  }

  @EventPattern('product_deleted')
  handleProductDeleted(@Payload() productId: string) {
    console.log('[Inventory Manager] Deleting inventory for product:', productId);
    return this.inventoryManagerService.deleteInventory(productId);
  }
}
