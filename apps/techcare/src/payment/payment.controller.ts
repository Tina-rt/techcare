import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface CreatePaymentIntentBody {
  orderId: string;
  amount: number;
  currency: string;
}

interface ConfirmPaymentBody {
  paymentIntentId: string;
  paymentMethodId: string;
}

@Controller('payment')
export class PaymentController {
  constructor(
    @Inject('PAYMENT_MANAGER_SERVICE')
    private readonly paymentClient: ClientProxy,
  ) {}

  @Post('create-intent')
  async createPaymentIntent(@Body() body: CreatePaymentIntentBody): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.paymentClient.send({ cmd: 'create_payment_intent' }, body),
    );
  }

  @Post('confirm')
  async confirmPayment(@Body() body: ConfirmPaymentBody): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.paymentClient.send({ cmd: 'confirm_payment' }, body),
    );
  }

  @Post('refund')
  async refundPayment(
    @Body() body: { paymentIntentId: string },
  ): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.paymentClient.send({ cmd: 'refund_payment' }, body),
    );
  }

  @Get('intent/:paymentIntentId')
  async getPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
  ): Promise<unknown> {
    return firstValueFrom<unknown>(
      this.paymentClient.send(
        { cmd: 'get_payment_intent' },
        { paymentIntentId },
      ),
    );
  }
}
