import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  DATABASE_CONNECTION,
  inventory as inventoryTable,
  type Inventory,
} from '@app/database';
import * as schema from '@app/database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class InventoryManagerService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject('PAYMENT_MANAGER_SERVICE')
    private readonly paymentClient: ClientProxy,
    @Inject('ORDER_MANAGER_SERVICE')
    private readonly orderClient: ClientProxy,
  ) {}

  async getStock(productId: string): Promise<Inventory | undefined> {
    const results = await this.db
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.productId, productId));
    return results[0];
  }

  async updateStock(productId: string, quantity: number) {
    const existing = await this.getStock(productId);
    if (existing) {
      return this.db
        .update(inventoryTable)
        .set({ quantity, lastUpdated: new Date() })
        .where(eq(inventoryTable.productId, productId))
        .returning();
    } else {
      return this.db
        .insert(inventoryTable)
        .values({ productId, quantity })
        .returning();
    }
  }

  async getAllInventory() {
    return this.db.select().from(inventoryTable);
  }

  async reserveStock(data: any) {
    const { orderId, items, userId } = data;
    try {
      for (const item of items) {
        const stock = await this.getStock(item.productId);
        if (!stock || stock.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      // Reserve stock (decrement)
      for (const item of items) {
        const stock = (await this.getStock(item.productId))!;
        await this.updateStock(item.productId, stock.quantity - item.quantity);
      }

      // Success: Emit to PaymentService
      this.paymentClient.emit('stock_reserved', {
        orderId,
        items,
        userId,
      });
    } catch (error) {
      // Failure: Emit to OrderService to cancel
      this.orderClient.emit('stock_reservation_failed', {
        orderId,
        reason: error.message,
      });
    }
  }

  async releaseStock(data: any) {
    const { items } = data;
    // Compensation: logic to re-increment stock
    for (const item of items) {
      const stock = await this.getStock(item.productId);
      if (stock) {
        await this.updateStock(item.productId, stock.quantity + item.quantity);
      }
    }
  }
}
