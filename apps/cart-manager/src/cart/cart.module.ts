import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'PRODUCT_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'product_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
