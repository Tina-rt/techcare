import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
    ClientsModule.register([
      {
        name: 'INVENTORY_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'inventory_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
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
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
