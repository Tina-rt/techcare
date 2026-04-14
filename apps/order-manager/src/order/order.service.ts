import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument, Order as OrderSchema } from './schemas/order.schema';
import {
  Order,
  Cart,
  CreateOrderDto,
  OrderStatus,
  PaymentStatus,
} from '@app/shared';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(OrderSchema.name) private orderModel: Model<OrderDocument>,
    @Inject('CART_MANAGER_SERVICE')
    private readonly cartClient: ClientProxy,
    @Inject('NOTIFICATION_MANAGER_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, shippingAddress, notes } = createOrderDto;

    // Get cart from cart service
    const cart = await firstValueFrom(
      this.cartClient.send<Cart>({ cmd: 'get_cart' }, { userId }),
    );

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new RpcException('Cart is empty');
    }

    // Create order from cart
    const order = new this.orderModel({
      userId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      shippingAddress,
      notes,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    const savedOrder = await order.save();

    // Clear cart after order creation
    await firstValueFrom(
      this.cartClient.send({ cmd: 'clear_cart' }, { userId }),
    );

    // Initialiser la Saga : Valider les produits via ProductService
    this.productClient.emit('order_created', {
      orderId: savedOrder._id.toString(),
      items: savedOrder.items,
      userId: savedOrder.userId,
    });

    // Envoyer une notification de création de commande (en attente)
    this.notificationClient.emit('order_created_pending', {
      userId,
      orderId: savedOrder._id.toString(),
      totalAmount: savedOrder.totalAmount,
    });

    return savedOrder.toObject() as unknown as Order;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new RpcException('Order not found');
    }
    return order.toObject() as unknown as Order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = await this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return orders as unknown as Order[];
  }

  async getAllOrders(): Promise<Order[]> {
    const orders = await this.orderModel.find().sort({ createdAt: -1 }).exec();
    return orders as unknown as Order[];
  }

  async updateOrderStatus(
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const { orderId, status, trackingNumber } = updateOrderStatusDto;

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    const updatedOrder = await order.save();

    // Send notification
    this.notificationClient.emit('order_status_updated', {
      userId: order.userId,
      orderId: order._id.toString(),
      status,
    });

    return updatedOrder.toObject() as unknown as Order;
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
    paymentIntentId?: string,
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = paymentStatus as PaymentStatus;
    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }

    // If payment is completed, update order status to processing
    if (paymentStatus === 'completed') {
      order.status = OrderStatus.PROCESSING;
    }

    const updatedOrder = await order.save();
    return updatedOrder.toObject() as unknown as Order;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new RpcException('Order not found');
    }

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new RpcException('Cannot cancel shipped or delivered order');
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await order.save();

    // Send notification
    this.notificationClient.emit('order_cancelled', {
      userId: order.userId,
      orderId: order._id.toString(),
    });

    return updatedOrder.toObject() as unknown as Order;
  }

  async finalizeOrder(data: { orderId: string }): Promise<void> {
    const { orderId } = data;
    const order = await this.orderModel.findById(orderId);
    if (order) {
      order.status = OrderStatus.PROCESSING;
      order.paymentStatus = PaymentStatus.COMPLETED;
      await order.save();

      // Notification finale
      this.notificationClient.emit('order_confirmed', {
        userId: order.userId,
        orderId: order._id.toString(),
      });
    }
  }

  async handleSagaFailure(
    data: { orderId: string; reason?: string },
    reason: string,
  ): Promise<void> {
    const { orderId } = data;
    const order = await this.orderModel.findById(orderId);
    if (order) {
      order.status = OrderStatus.CANCELLED;
      await order.save();

      // Notification d'échec
      this.notificationClient.emit('order_failed', {
        userId: order.userId,
        orderId: order._id.toString(),
        reason: data.reason || reason,
      });
    }
  }
}
