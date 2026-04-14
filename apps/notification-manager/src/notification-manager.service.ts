import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification-realtime/notification.gateway';
import { NotificationRealtimeService } from './notification-realtime/notification-realtime.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationManagerService {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationRealtimeService: NotificationRealtimeService,
  ) {}

  async sendNotification(data: CreateNotificationDto) {
    // 1. Store in Postgres via Drizzle
    const [savedNotification] =
      await this.notificationRealtimeService.createNotification(data);

    // 2. Dispatch in real-time if a userId is provided
    if (data.userId) {
      const channel = `user_${data.userId}`;
      this.notificationGateway.sendNotification(savedNotification, channel);
    }

    return savedNotification;
  }

  async getAllForUser(userId: number) {
    return this.notificationRealtimeService.getAllNotificationsFromUserId(
      userId,
    );
  }
}
