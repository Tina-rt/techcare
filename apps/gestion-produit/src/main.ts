import { NestFactory } from '@nestjs/core';
import { GestionProduitModule } from './gestion-produit.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(GestionProduitModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
