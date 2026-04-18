import { Module } from '@nestjs/common';
import { OrderManagerController } from './order-manager.controller';
import { OrderManagerService } from './order-manager.service';
import { OrderModule } from './order/order.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: 'CART_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'cart_manager_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'NOTIFICATION_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'notification_manager_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
    OrderModule,
  ],
  controllers: [OrderManagerController],
  providers: [OrderManagerService],
})
export class OrderManagerModule {}
