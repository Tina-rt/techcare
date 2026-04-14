import { Module } from '@nestjs/common';
import { NotificationRealtimeService } from './notification-realtime.service';
import { NotificationRealtimeController } from './notification-realtime.controller';
import { NotificationGateway } from './notification.gateway';

@Module({
  providers: [NotificationRealtimeService, NotificationGateway],
  controllers: [NotificationRealtimeController],
  exports: [NotificationRealtimeService, NotificationGateway],
})
export class NotificationRealtimeModule {}
