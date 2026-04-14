import { Module } from '@nestjs/common';
import { CartManagerController } from './cart-manager.controller';
import { CartManagerService } from './cart-manager.service';
import { CartModule } from './cart/cart.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5672'],
          queue: 'product_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    MongooseModule.forRoot(
      'mongodb://root:example@localhost:27017/cart-manager?authSource=admin',
    ),
    CartModule,
  ],
  controllers: [CartManagerController],
  providers: [CartManagerService],
})
export class CartManagerModule {}
