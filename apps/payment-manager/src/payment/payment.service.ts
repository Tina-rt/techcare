import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { StockReservedPayload } from '@app/shared';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @Inject('ORDER_MANAGER_SERVICE')
    private readonly orderClient: ClientProxy,
    @Inject('INVENTORY_MANAGER_SERVICE')
    private readonly inventoryClient: ClientProxy,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
    });
  }

  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<unknown> {
    const { orderId, amount, currency } = createPaymentIntentDto;

    try {
      // Create payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: currency.toLowerCase(),
        metadata: {
          orderId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update order with payment intent ID
      await firstValueFrom(
        this.orderClient.send(
          { cmd: 'update_payment_status' },
          {
            orderId,
            paymentStatus: 'pending',
            paymentIntentId: paymentIntent.id,
          },
        ),
      );

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to create payment intent: ${message}`,
      );
    }
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<unknown> {
    const { paymentIntentId, orderId } = confirmPaymentDto;

    try {
      // Retrieve payment intent from Stripe
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update order payment status
        await firstValueFrom(
          this.orderClient.send(
            { cmd: 'update_payment_status' },
            {
              orderId,
              paymentStatus: 'completed',
              paymentIntentId,
            },
          ),
        );

        return {
          success: true,
          status: 'succeeded',
          message: 'Payment confirmed successfully',
        };
      } else {
        return {
          success: false,
          status: paymentIntent.status,
          message: 'Payment not yet completed',
        };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to confirm payment: ${message}`,
      );
    }
  }

  async handleWebhook(sig: string, payload: Buffer): Promise<unknown> {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        webhookSecret,
      );

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          const orderId = paymentIntent.metadata.orderId;

          if (orderId) {
            await firstValueFrom(
              this.orderClient.send(
                { cmd: 'update_payment_status' },
                {
                  orderId,
                  paymentStatus: 'completed',
                  paymentIntentId: paymentIntent.id,
                },
              ),
            );
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const failedPayment = event.data.object;
          const failedOrderId = failedPayment.metadata.orderId;

          if (failedOrderId) {
            await firstValueFrom(
              this.orderClient.send(
                { cmd: 'update_payment_status' },
                {
                  orderId: failedOrderId,
                  paymentStatus: 'failed',
                  paymentIntentId: failedPayment.id,
                },
              ),
            );
          }
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Webhook Error: ${message}`);
    }
  }

  async refundPayment(paymentIntentId: string): Promise<unknown> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to process refund: ${message}`,
      );
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<unknown> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to retrieve payment intent: ${message}`,
      );
    }
  }

  async processSagaPayment(data: StockReservedPayload): Promise<void> {
    const { orderId } = data;
    try {
      // Pour une vraie Saga, on pourrait récupérer le montant de la commande
      // et tenter un paiement automatique si le client a une carte enregistrée.
      // Ici, on simule que le paiement est prêt à être traité (Succeeded).

      console.log(
        `[Payment Service] Processing Saga payment for order: ${orderId}`,
      );

      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Émettre le succès vers Order Service
      this.orderClient.emit('payment_completed', { orderId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Payment Service] Saga payment failed: ${message}`);
      this.orderClient.emit('payment_failed', {
        orderId,
        reason: message,
      });
    }
  }
}
