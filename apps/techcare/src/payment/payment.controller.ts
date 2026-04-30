import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Inject,
  Headers,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { sendAndCatch } from '@app/shared/utils/rpc.util';

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
  async createPaymentIntent(
    @Body() body: CreatePaymentIntentBody,
  ): Promise<unknown> {
    return sendAndCatch(
      this.paymentClient,
      { cmd: 'create_payment_intent' },
      body,
    );
  }

  @Post('confirm')
  async confirmPayment(@Body() body: ConfirmPaymentBody): Promise<unknown> {
    return sendAndCatch(this.paymentClient, { cmd: 'confirm_payment' }, body);
  }

  @Post('refund')
  async refundPayment(
    @Body() body: { paymentIntentId: string },
  ): Promise<unknown> {
    return sendAndCatch(this.paymentClient, { cmd: 'refund_payment' }, body);
  }

  @Get('intent/:paymentIntentId')
  async getPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
  ): Promise<unknown> {
    return sendAndCatch(
      this.paymentClient,
      { cmd: 'get_payment_intent' },
      { paymentIntentId },
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) {
      console.error('[GATEWAY] Raw body is missing for webhook');
      return { received: false };
    }

    // Forward to payment microservice via RabbitMQ
    this.paymentClient.emit('stripe_webhook', {
      signature: sig,
      payload: request.rawBody.toString('utf8'),
    });

    return { received: true };
  }
}
