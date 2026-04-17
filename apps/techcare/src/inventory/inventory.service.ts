import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendAndCatch } from '@app/shared';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('INVENTORY_MANAGER_SERVICE')
    private readonly inventoryClient: ClientProxy,
  ) {}

  async getStock(productId: string): Promise<unknown> {
    return sendAndCatch<unknown>(this.inventoryClient, 'get_stock', productId);
  }

  async updateStock(productId: string, quantity: number): Promise<unknown> {
    return sendAndCatch<unknown>(this.inventoryClient, 'update_stock', { productId, quantity });
  }

  async findAll(): Promise<unknown> {
    return sendAndCatch<unknown>(this.inventoryClient, 'find_all_inventory', {});
  }
}
