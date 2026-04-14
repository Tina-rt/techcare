import { Module } from '@nestjs/common';
import { NotificationManagerController } from './notification-manager.controller';
import { NotificationManagerService } from './notification-manager.service';

import { NotificationRealtimeModule } from './notification-realtime/notification-realtime.module';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';
import { MailSenderModule } from './mail-sender/mail-sender.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    NotificationRealtimeModule,
    DatabaseModule,
    MailSenderModule,
  ],
  controllers: [NotificationManagerController],
  providers: [NotificationManagerService],
})
export class NotificationManagerModule {}
