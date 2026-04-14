import { NestFactory } from '@nestjs/core';
import { NotificationManagerModule } from './notification-manager.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create HTTP server for WebSocket
  const app = await NestFactory.create(NotificationManagerModule);
  await app.listen(5001);

  // Create RabbitMQ microservice
  const microservice = app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'notification_manager_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices();
}
bootstrap();
