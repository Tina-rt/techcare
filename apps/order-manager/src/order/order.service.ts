import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc, and, ne, or } from 'drizzle-orm';
import * as schema from '@app/database/schema';
import { orders, User } from '@app/database/schema';
import { DATABASE_CONNECTION } from '@app/database';
import {
  Order,
  Cart,
  CreateOrderDto,
  OrderStatus,
  PaymentStatus,
  OrderItem,
  ShippingAddress,
  DashboardStats,
  sendAndCatch,
} from '@app/shared';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject('CART_MANAGER_SERVICE')
    private readonly cartClient: ClientProxy,
    @Inject('NOTIFICATION_MANAGER_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, shippingAddress, shippingFee, notes } = createOrderDto;

    // Get cart from cart service
    const cart = await sendAndCatch<Cart>(
      this.cartClient,
      { cmd: 'get_cart' },
      { userId },
    );

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new RpcException('Cart is empty');
    }

    const [savedOrder] = await this.db
      .insert(orders)
      .values({
        userId,
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        shippingAddress,
        shippingFee,
        notes,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      })
      .returning();

    // Clear cart after order creation
    await sendAndCatch(this.cartClient, { cmd: 'clear_cart' }, { userId });

    // Initiate Saga: validate products via ProductService
    this.productClient.emit('order_created', {
      orderId: savedOrder.id.toString(),
      items: savedOrder.items,
      userId: savedOrder.userId,
    });

    // Send pending order notification
    this.notificationClient.emit('send_notification', {
      userId,
      title: 'Commande Initiée',
      message: `Votre commande #${savedOrder.id} a été créée et est en attente de paiement.`,
    });

    return this.toOrder(savedOrder);
  }

  async getOrderById(orderId: string): Promise<Order> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (!order) throw new RpcException('Order not found');
    return this.toOrder(order);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    return rows.map(this.toOrder);
  }

  async getAllOrders(): Promise<Order[]> {
    const rows = await this.db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    return rows.map(this.toOrder);
  }

  async updateOrderStatus(
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const { orderId, status, trackingNumber } = updateOrderStatusDto;

    const [existing] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (!existing) throw new NotFoundException('Order not found');

    const [updated] = await this.db
      .update(orders)
      .set({
        status,
        ...(trackingNumber && { trackingNumber }),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderId)))
      .returning();

    this.notificationClient.emit('order_status_updated', {
      userId: existing.userId,
      orderId,
      status,
    });

    return this.toOrder(updated);
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
    paymentIntentId?: string,
  ): Promise<Order> {
    const [existing] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (!existing) throw new NotFoundException('Order not found');

    const [updated] = await this.db
      .update(orders)
      .set({
        paymentStatus,
        ...(paymentIntentId && { paymentIntentId }),
        ...(paymentStatus === 'completed' && {
          status: OrderStatus.PROCESSING,
        }),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderId)))
      .returning();

    // Clean obsolete checkout rows
    if (paymentStatus === 'completed') {
      await this.db
        .update(orders)
        .set({
          status: OrderStatus.CANCELLED,
          notes: 'Obsolete - Remplacée par une commande payée',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.userId, existing.userId),
            ne(orders.id, parseInt(orderId)),
            or(
              eq(orders.paymentStatus, PaymentStatus.PENDING),
              eq(orders.paymentStatus, PaymentStatus.FAILED),
            ),
          ),
        );
    }

    // Trigger Notifications based on new payment status
    if (paymentStatus === 'completed') {
      this.notificationClient.emit('send_notification', {
        userId: existing.userId,
        title: 'Paiement Réussi',
        message: `Le paiement de votre commande #${orderId} a été validé. Elle est en cours de préparation.`,
      });
    } else if (paymentStatus === 'failed') {
      this.notificationClient.emit('send_notification', {
        userId: existing.userId,
        title: 'Paiement Refusé',
        message: `Le paiement de la commande #${orderId} a échoué. Vous pouvez réessayer le paiement depuis votre profil.`,
      });
    }

    return this.toOrder(updated);
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const [existing] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (!existing) throw new RpcException('Order not found');

    if (
      existing.status === OrderStatus.SHIPPED ||
      existing.status === OrderStatus.DELIVERED
    ) {
      throw new RpcException('Cannot cancel shipped or delivered order');
    }

    const [updated] = await this.db
      .update(orders)
      .set({
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.CANCELLED,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderId)))
      .returning();

    this.notificationClient.emit('order_cancelled', {
      userId: existing.userId,
      orderId,
    });

    return this.toOrder(updated);
  }

  async finalizeOrder(data: { orderId: string }): Promise<void> {
    const { orderId } = data;
    const [existing] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (existing) {
      await this.db
        .update(orders)
        .set({
          status: OrderStatus.PROCESSING,
          paymentStatus: PaymentStatus.COMPLETED,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, parseInt(orderId)));

      this.notificationClient.emit('order_confirmed', {
        userId: existing.userId,
        orderId,
      });
    }
  }

  async handleSagaFailure(
    data: { orderId: string; reason?: string },
    reason: string,
  ): Promise<void> {
    const { orderId } = data;
    const [existing] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (existing) {
      await this.db
        .update(orders)
        .set({ status: OrderStatus.CANCELLED, updatedAt: new Date() })
        .where(eq(orders.id, parseInt(orderId)));

      this.notificationClient.emit('order_failed', {
        userId: existing.userId,
        orderId,
        reason: data.reason || reason,
      });
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const completedOrders = await this.db
      .select()
      .from(orders)
      .where(eq(orders.paymentStatus, PaymentStatus.COMPLETED));

    const totalRevenue = completedOrders.reduce(
      (acc, order) => acc + order.totalAmount,
      0,
    );
    const totalProductsOrdered = completedOrders.reduce(
      (acc, order) => acc + order.totalItems,
      0,
    );

    // Monthly Sales Graph
    const salesAmountGraph = {
      labels: [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sept',
        'Oct',
        'Nov',
        'Déc',
      ],
      datasets: [
        {
          label: 'Ventes (Ar)',
          data: new Array(12).fill(0),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4,
        },
      ],
    };

    // Product Distribution Graph
    const productCounts: Record<string, number> = {};

    completedOrders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      salesAmountGraph.datasets[0].data[month] += order.totalAmount;

      (order.items as OrderItem[]).forEach((item) => {
        productCounts[item.name] =
          (productCounts[item.name] || 0) + item.quantity;
      });
    });

    const orderedProductGraph = {
      labels: Object.keys(productCounts).slice(0, 5),
      datasets: [
        {
          data: Object.values(productCounts).slice(0, 5),
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
          ],
        },
      ],
    };

    return {
      totalRevenue,
      totalProductsOrdered,
      orders: completedOrders.slice(0, 10).map(this.toOrder),
      salesAmountGraph,
      orderedProductGraph,
    };
  }

  private toOrder(row: typeof orders.$inferSelect): Order {
    return {
      _id: row.id.toString(),
      userId: row.userId,
      items: (row.items as OrderItem[]) ?? [],
      totalAmount: row.totalAmount,
      totalItems: row.totalItems,
      status: row.status as OrderStatus,
      paymentStatus: row.paymentStatus as PaymentStatus,
      paymentIntentId: row.paymentIntentId ?? undefined,
      shippingAddress: row.shippingAddress as ShippingAddress,
      shippingFee: row.shippingFee,
      trackingNumber: row.trackingNumber ?? undefined,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
