import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  sendAndCatch,
  Product,
  Inventory,
  InventoryWithProduct,
  UpdateStockDto,
  StockMovement,
} from '@app/shared';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @Inject('INVENTORY_MANAGER_SERVICE')
    private readonly inventoryClient: ClientProxy,
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async getStock(productId: string): Promise<InventoryWithProduct | null> {
    const stock = await sendAndCatch<Inventory>(
      this.inventoryClient,
      'get_stock',
      productId,
    );
    if (!stock) return null;

    try {
      const product = await sendAndCatch<Product>(
        this.productClient,
        'find_product_by_id',
        productId,
      );
      return {
        ...stock,
        product,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch product info for ${productId}:`,
        error instanceof Error ? error.message : String(error),
      );
      return {
        ...stock,
        product: null,
      };
    }
  }

  async updateStock(productId: string, quantity: number): Promise<Inventory[]> {
    return sendAndCatch<Inventory[]>(this.inventoryClient, 'update_stock', {
      productId,
      quantity,
    } as UpdateStockDto);
  }

  async findAll(): Promise<InventoryWithProduct[]> {
    const inventory = await sendAndCatch<Inventory[]>(
      this.inventoryClient,
      'find_all_inventory',
      {},
    );
    return this.aggregateProductInfo(inventory);
  }

  async getMovements(productId?: string): Promise<StockMovement[]> {
    console.log('sending get_movements', productId);
    return sendAndCatch<StockMovement[]>(
      this.inventoryClient,
      'get_movements',
      productId || {},
    );
  }

  private async aggregateProductInfo(
    inventory: Inventory[],
  ): Promise<InventoryWithProduct[]> {
    if (!inventory || !inventory.length) return [];

    try {
      const products = await sendAndCatch<Product[]>(
        this.productClient,
        'find_all_products',
        {},
      );

      const productMap = new Map(
        products.map((p) => [(p as Product & { _id?: string })._id?.toString(), p]),
      );

      return inventory.map((item) => ({
        ...item,
        product: productMap.get(item.productId) ?? null,
      }));
    } catch (error) {
      this.logger.error('Failed to aggregate product info:', error);
      return inventory.map((item) => ({ ...item, product: null }));
    }
  }
}
