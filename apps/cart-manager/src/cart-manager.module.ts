import { Module } from '@nestjs/common';
import { CartManagerController } from './cart-manager.controller';
import { CartManagerService } from './cart-manager.service';
import { CartModule } from './cart/cart.module';
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
        name: 'PRODUCT_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://admin:admin@localhost:5672',
          ],
          queue: 'product_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    CartModule,
  ],
  controllers: [CartManagerController],
  providers: [CartManagerService],
})
export class CartManagerModule {}
