import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateOrderDto,
  Order,
  UpdateOrderStatusDto,
  convertToCsv,
  sendAndCatch,
} from '@app/shared';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(
    @Inject('ORDER_MANAGER_SERVICE')
    private readonly orderClient: ClientProxy,
    private readonly orderService: OrderService,
  ) {}

  @Post('create')
  async createOrder(@Body() body: CreateOrderDto): Promise<Order> {
    return sendAndCatch<Order>(this.orderClient, { cmd: 'create_order' }, body);
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string): Promise<Order | null> {
    return this.orderService.getOrderById(orderId);
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string): Promise<Order[]> {
    return this.orderService.getUserOrders(userId);
  }

  @Get()
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Get('export')
  async exportOrders(@Res() res: Response) {
    const orders = await this.orderService.getAllOrders();

    const csv = convertToCsv(orders, [
      { field: '_id', header: 'ID' },
      { field: 'userId', header: 'Client ID' },
      { field: 'userEmail', header: 'Email Client' },
      { field: 'totalAmount', header: 'Montant Total' },
      { field: 'status', header: 'Statut' },
      { field: 'paymentStatus', header: 'Paiement' },
      { field: 'createdAt', header: 'Date' },
    ]);

    res.header('Content-Type', 'text/csv');
    res.attachment(`orders_${new Date().getTime()}.csv`);
    return res.send(csv);
  }

  @Put('status')
  async updateOrderStatus(@Body() body: UpdateOrderStatusDto): Promise<Order> {
    return sendAndCatch<Order>(
      this.orderClient,
      { cmd: 'update_order_status' },
      body,
    );
  }

  @Put('cancel/:orderId')
  async cancelOrder(@Param('orderId') orderId: string): Promise<Order> {
    return sendAndCatch<Order>(
      this.orderClient,
      { cmd: 'cancel_order' },
      { orderId },
    );
  }
}
