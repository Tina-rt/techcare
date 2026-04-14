import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('INVENTORY_MANAGER_SERVICE')
    private readonly inventoryClient: ClientProxy,
  ) {}

  async getStock(productId: string): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.inventoryClient.send('get_stock', productId),
    );
  }

  async updateStock(productId: string, quantity: number): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.inventoryClient.send('update_stock', { productId, quantity }),
    );
  }

  async findAll(): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.inventoryClient.send('find_all_inventory', {}),
    );
  }
}
