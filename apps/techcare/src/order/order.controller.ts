import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('order')
export class OrderController {
  constructor(
    @Inject('ORDER_MANAGER_SERVICE')
    private readonly orderClient: ClientProxy,
  ) {}

  @Post('create')
  async createOrder(@Body() body: any): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.orderClient.send({ cmd: 'create_order' }, body),
    );
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.orderClient.send({ cmd: 'get_order' }, { orderId }),
    );
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.orderClient.send({ cmd: 'get_user_orders' }, { userId }),
    );
  }

  @Get()
  async getAllOrders(): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.orderClient.send({ cmd: 'get_all_orders' }, {}),
    );
  }

  @Put('status')
  async updateOrderStatus(@Body() body: any): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.orderClient.send({ cmd: 'update_order_status' }, body),
    );
  }

  @Put('cancel/:orderId')
  async cancelOrder(@Param('orderId') orderId: string): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.orderClient.send({ cmd: 'cancel_order' }, { orderId }),
    );
  }
}
