import { Module } from '@nestjs/common';
import { InventoryManagerController } from './inventory-manager.controller';
import { InventoryManagerService } from './inventory-manager.service';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'PAYMENT_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5672'],
          queue: 'payment_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
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
  ],
  controllers: [InventoryManagerController],
  providers: [InventoryManagerService],
})
export class InventoryManagerModule {}
