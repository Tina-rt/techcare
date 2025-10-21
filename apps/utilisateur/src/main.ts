import { NestFactory } from '@nestjs/core';
import { UtilisateurModule } from './utilisateur.module';

async function bootstrap() {
  const app = await NestFactory.create(UtilisateurModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
