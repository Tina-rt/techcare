import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto, Order } from '@app/shared';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  @MessagePattern({ cmd: 'get_order' })
  async getOrderById(@Payload() data: { orderId: string }): Promise<Order> {
    return this.orderService.getOrderById(data.orderId);
  }

  @MessagePattern({ cmd: 'get_user_orders' })
  async getUserOrders(@Payload() data: { userId: string }): Promise<Order[]> {
    return this.orderService.getUserOrders(data.userId);
  }

  @MessagePattern({ cmd: 'get_all_orders' })
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @MessagePattern({ cmd: 'update_order_status' })
  async updateOrderStatus(
    @Payload() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(updateOrderStatusDto);
  }

  @MessagePattern({ cmd: 'update_payment_status' })
  async updatePaymentStatus(
    @Payload()
    data: {
      orderId: string;
      paymentStatus: string;
      paymentIntentId?: string;
    },
  ): Promise<Order> {
    return this.orderService.updatePaymentStatus(
      data.orderId,
      data.paymentStatus,
      data.paymentIntentId,
    );
  }

  @MessagePattern({ cmd: 'cancel_order' })
  async cancelOrder(@Payload() data: { orderId: string }): Promise<Order> {
    return this.orderService.cancelOrder(data.orderId);
  }

  @EventPattern('payment_completed')
  handlePaymentCompleted(@Payload() data: { orderId: string }): Promise<void> {
    return this.orderService.finalizeOrder(data);
  }

  @EventPattern('payment_failed')
  handlePaymentFailed(
    @Payload() data: { orderId: string; reason?: string },
  ): Promise<void> {
    return this.orderService.handleSagaFailure(data, 'Payment failed');
  }

  @EventPattern('stock_reservation_failed')
  handleStockReservationFailed(
    @Payload() data: { orderId: string; reason?: string },
  ): Promise<void> {
    return this.orderService.handleSagaFailure(
      data,
      'Stock reservation failed',
    );
  }

  @EventPattern('product_validation_failed')
  handleProductValidationFailed(
    @Payload() data: { orderId: string; reason?: string },
  ): Promise<void> {
    return this.orderService.handleSagaFailure(
      data,
      'Product validation failed',
    );
  }
}
