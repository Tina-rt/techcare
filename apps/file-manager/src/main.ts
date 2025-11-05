import { NestFactory } from '@nestjs/core';
import { FileManagerModule } from './file-manager.module';

async function bootstrap() {
  const app = await NestFactory.create(FileManagerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
