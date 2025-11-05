import { Module } from '@nestjs/common';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AwsConfigService } from './config/aws.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/file-manager/.env'],
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [FileManagerController],
  providers: [FileManagerService, AwsConfigService],
})
export class FileManagerModule {}
