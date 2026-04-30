import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order, sendAndCatch } from '@app/shared';
import { User } from '@app/database';

@Injectable()
export class OrderService {
  constructor(
    @Inject('ORDER_MANAGER_SERVICE')
    private readonly orderClient: ClientProxy,
    @Inject('USER_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  async getOrderById(orderId: string): Promise<Order | null> {
    const order = await sendAndCatch<Order>(
      this.orderClient,
      { cmd: 'get_order' },
      { orderId },
    );
    if (!order) return null;
    return this.enrichOrder(order);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = await sendAndCatch<Order[]>(
      this.orderClient,
      { cmd: 'get_user_orders' },
      { userId },
    );
    if (!orders) return [];
    return this.enrichOrders(orders);
  }

  async getAllOrders(): Promise<Order[]> {
    const orders = await sendAndCatch<Order[]>(
      this.orderClient,
      { cmd: 'get_all_orders' },
      {},
    );
    if (!orders) return [];
    return this.enrichOrders(orders);
  }

  private async enrichOrders(orders: Order[]): Promise<Order[]> {
    return Promise.all(orders.map((order) => this.enrichOrder(order)));
  }

  private async enrichOrder(order: Order): Promise<Order> {
    try {
      const user = await firstValueFrom<User>(
        this.userClient.send('find_user_by_id', order.userId),
      );
      if (user && user.email) {
        order.userEmail = user.email;
      }
    } catch (error) {
      console.error(
        `[Gateway OrderService] Failed to enrich order ${order._id} for user ${order.userId}:`,
        error.message,
      );
    }
    return order;
  }
}
