import { NestFactory } from '@nestjs/core';
import { FileManagerModule } from './file-manager.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(FileManagerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'file_manager_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.listen();
}
bootstrap();
