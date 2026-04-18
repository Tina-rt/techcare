import { Controller, Post, Headers, Body, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto';
import { StockReservedPayload } from '@app/shared';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern({ cmd: 'create_payment_intent' })
  async createPaymentIntent(
    @Payload() createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<unknown> {
    return this.paymentService.createPaymentIntent(createPaymentIntentDto);
  }

  @MessagePattern({ cmd: 'confirm_payment' })
  async confirmPayment(
    @Payload() confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<unknown> {
    return this.paymentService.confirmPayment(confirmPaymentDto);
  }

  @MessagePattern({ cmd: 'refund_payment' })
  async refundPayment(
    @Payload() data: { paymentIntentId: string },
  ): Promise<unknown> {
    return this.paymentService.refundPayment(data.paymentIntentId);
  }

  @MessagePattern({ cmd: 'get_payment_intent' })
  async getPaymentIntent(
    @Payload() data: { paymentIntentId: string },
  ): Promise<unknown> {
    return this.paymentService.getPaymentIntent(data.paymentIntentId);
  }

  // HTTP endpoint for Stripe webhooksx
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<unknown> {
    if (!request.rawBody) {
      throw new Error('Raw body is missing');
    }
    return this.paymentService.handleWebhook(sig, request.rawBody);
  }

  @EventPattern('stock_reserved')
  handleStockReserved(@Payload() data: StockReservedPayload) {
    return this.paymentService.processSagaPayment(data);
  }
}
