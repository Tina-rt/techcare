import { NestFactory } from '@nestjs/core';
import { ProductManagerModule } from './product-manager.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProductManagerModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
