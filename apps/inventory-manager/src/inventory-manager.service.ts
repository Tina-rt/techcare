import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  DATABASE_CONNECTION,
  inventory as inventoryTable,
  stockMovements as movementsTable,
} from '@app/database';
import * as schema from '@app/database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import {
  Inventory,
  StockReservationDto,
  StockReleaseDto,
  StockMovementType,
  StockMovement,
} from '@app/shared';

@Injectable()
export class InventoryManagerService {
  private readonly logger = new Logger(InventoryManagerService.name);

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
    return results[0] as Inventory | undefined;
  }

  async updateStock(
    productId: string,
    quantity: number,
    movementType: StockMovementType = StockMovementType.ADJUSTMENT,
    referenceId?: string,
  ): Promise<Inventory[]> {
    const existing = await this.getStock(productId);
    const prevQuantity = existing?.quantity ?? 0;

    let updatedInventory: any[];

    if (existing) {
      updatedInventory = await this.db
        .update(inventoryTable)
        .set({ quantity, lastUpdated: new Date() })
        .where(eq(inventoryTable.productId, productId))
        .returning();
    } else {
      updatedInventory = await this.db
        .insert(inventoryTable)
        .values({
          productId,
          quantity,
          reservedQuantity: 0,
        })
        .returning();
    }

    await this.logMovement({
      productId,
      type: movementType,
      quantityChanged: quantity - prevQuantity,
      previousQuantity: prevQuantity,
      newQuantity: quantity,
      referenceId,
    });

    return updatedInventory as Inventory[];
  }

  async getAllInventory(): Promise<Inventory[]> {
    const results = await this.db.select().from(inventoryTable);
    return results as Inventory[];
  }

  /**
   * Logical Reservation: Increases reservedQuantity, physical quantity stays the same.
   */
  async reserveStock(data: StockReservationDto): Promise<void> {
    const { orderId, items, userId } = data;
    try {
      for (const item of items) {
        const stock = await this.getStock(item.productId);
        const available =
          (stock?.quantity ?? 0) - (stock?.reservedQuantity ?? 0);

        if (!stock || available < item.quantity) {
          throw new Error(
            `Insufficient available stock for product ${item.productId}`,
          );
        }
      }

      // Reserve stock (Logical hold)
      for (const item of items) {
        const stock = (await this.getStock(item.productId))!;
        const newReserved = stock.reservedQuantity + item.quantity;

        await this.db
          .update(inventoryTable)
          .set({
            reservedQuantity: newReserved,
            lastUpdated: new Date(),
          })
          .where(eq(inventoryTable.productId, item.productId));

        await this.logMovement({
          productId: item.productId,
          type: StockMovementType.RESERVATION,
          quantityChanged: item.quantity,
          previousQuantity: stock.quantity, // Physical quantity hasn't changed
          newQuantity: stock.quantity,
          referenceId: orderId,
          reason: 'Order logical reservation',
        });
      }

      // Success: Emit to PaymentService
      this.paymentClient.emit('stock_reserved', {
        orderId,
        items,
        userId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Stock reservation failed: ${message}`);
      this.orderClient.emit('stock_reservation_failed', {
        orderId,
        reason: message,
      });
    }
  }

  /**
   * Finalize Stock (Order Complete): Decrease BOTH physical quantity and reservedQuantity.
   */
  async finalizeStock(data: { orderId: string; items: any[] }): Promise<void> {
    const { orderId, items } = data;
    this.logger.log(`Finalizing stock for order: ${orderId}`);

    for (const item of items) {
      const stock = await this.getStock(item.productId);
      if (stock) {
        const newQuantity = stock.quantity - item.quantity;
        const newReserved = Math.max(0, stock.reservedQuantity - item.quantity);

        await this.db
          .update(inventoryTable)
          .set({
            quantity: newQuantity,
            reservedQuantity: newReserved,
            lastUpdated: new Date(),
          })
          .where(eq(inventoryTable.productId, item.productId));

        await this.logMovement({
          productId: item.productId,
          type: StockMovementType.FINALIZATION,
          quantityChanged: -item.quantity,
          previousQuantity: stock.quantity,
          newQuantity: newQuantity,
          referenceId: orderId,
          reason: 'Order completed, physical stock removed',
        });
      }
    }
  }

  /**
   * Release Stock (Order Cancelled/Failed): Decrement reservedQuantity.
   */
  async releaseStock(data: StockReleaseDto): Promise<void> {
    const { items } = data;
    // Compensation: logic to re-decrement reserved stock
    for (const item of items) {
      const stock = await this.getStock(item.productId);
      if (stock && stock.reservedQuantity > 0) {
        const newReserved = Math.max(0, stock.reservedQuantity - item.quantity);
        await this.db
          .update(inventoryTable)
          .set({
            reservedQuantity: newReserved,
            lastUpdated: new Date(),
          })
          .where(eq(inventoryTable.productId, item.productId));

        await this.logMovement({
          productId: item.productId,
          type: StockMovementType.RELEASE,
          quantityChanged: -item.quantity,
          previousQuantity: stock.quantity, // Physical stays same
          newQuantity: stock.quantity,
          reason: 'Stock reservation released',
        });
      }
    }
  }

  async getMovements(productId?: any): Promise<StockMovement[]> {
    if (productId && typeof productId === 'string') {
      const results = await this.db
        .select()
        .from(movementsTable)
        .where(eq(movementsTable.productId, productId));
      return results as StockMovement[];
    }
    const results = (await this.db.select().from(movementsTable)) ?? [];
    return results as StockMovement[];
  }

  private async logMovement(data: Partial<StockMovement>): Promise<void> {
    try {
      await this.db.insert(movementsTable).values({
        productId: data.productId!,
        type: data.type!,
        quantityChanged: data.quantityChanged!,
        previousQuantity: data.previousQuantity!,
        newQuantity: data.newQuantity!,
        referenceId: data.referenceId,
        reason: data.reason,
      });
    } catch (error) {
      this.logger.error('Failed to log stock movement:', error);
    }
  }
}
