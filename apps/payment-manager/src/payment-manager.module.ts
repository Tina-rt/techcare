import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentManagerController } from './payment-manager.controller';
import { PaymentManagerService } from './payment-manager.service';
import { PaymentModule } from './payment/payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: 'ORDER_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5672'],
          queue: 'order_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    PaymentModule,
  ],
  controllers: [PaymentManagerController],
  providers: [PaymentManagerService],
})
export class PaymentManagerModule {}
