import { Module } from '@nestjs/common';
import { OrderManagerController } from './order-manager.controller';
import { OrderManagerService } from './order-manager.service';
import { OrderModule } from './order/order.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
          urls: [process.env.RABBITMQ_URL || process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: 'cart_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'NOTIFICATION_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: 'notification_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    OrderModule,
  ],
  controllers: [OrderManagerController],
  providers: [OrderManagerService],
})
export class OrderManagerModule {}
