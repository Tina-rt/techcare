import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationRealtimeService } from './notification-realtime.service';
import { NotificationRealtimeController } from './notification-realtime.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'GATEWAY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: 'gateway_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [NotificationRealtimeService],
  controllers: [NotificationRealtimeController],
  exports: [NotificationRealtimeService],
})
export class NotificationRealtimeModule {}
