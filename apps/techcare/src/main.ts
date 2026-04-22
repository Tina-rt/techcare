import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from './common/filters/rpc-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:5400',
      'http://localhost:5400',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalFilters(new RpcExceptionFilter());
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap().catch((err) => console.error(err));
