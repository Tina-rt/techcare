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
import { firstValueFrom } from 'rxjs';
import {
  CreateOrderDto,
  Order,
  UpdateOrderStatusDto,
  sendAndCatch,
  convertToCsv,
} from '@app/shared';

@Controller('order')
export class OrderController {
  constructor(
    @Inject('ORDER_MANAGER_SERVICE')
    private readonly orderClient: ClientProxy,
  ) {}

  @Post('create')
  async createOrder(@Body() body: CreateOrderDto): Promise<Order> {
    return firstValueFrom<Order>(
      this.orderClient.send({ cmd: 'create_order' }, body),
    );
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string): Promise<Order> {
    return firstValueFrom<Order>(
      this.orderClient.send({ cmd: 'get_order' }, { orderId }),
    );
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string): Promise<Order[]> {
    return firstValueFrom<Order[]>(
      this.orderClient.send({ cmd: 'get_user_orders' }, { userId }),
    );
  }

  @Get()
  async getAllOrders(): Promise<Order[]> {
    return firstValueFrom<Order[]>(
      this.orderClient.send({ cmd: 'get_all_orders' }, {}),
    );
  }

  @Get('export')
  async exportOrders(@Res() res: Response) {
    const orders = await sendAndCatch<Order[]>(
      this.orderClient,
      { cmd: 'get_all_orders' },
      {},
    );

    const csv = convertToCsv(orders, [
      { field: 'id', header: 'ID' },
      { field: 'userId', header: 'Client ID' },
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
    return firstValueFrom<Order>(
      this.orderClient.send({ cmd: 'update_order_status' }, body),
    );
  }

  @Put('cancel/:orderId')
  async cancelOrder(@Param('orderId') orderId: string): Promise<Order> {
    return firstValueFrom<Order>(
      this.orderClient.send({ cmd: 'cancel_order' }, { orderId }),
    );
  }
}
