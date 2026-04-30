import { Injectable } from '@nestjs/common';
import { NotificationRealtimeService } from './notification-realtime/notification-realtime.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationManagerService {
  constructor(
    private readonly notificationRealtimeService: NotificationRealtimeService,
  ) {}

  async sendNotification(data: CreateNotificationDto) {
    // 1. Store in Postgres via Drizzle
    const [savedNotification] =
      await this.notificationRealtimeService.createNotification(data);

    return savedNotification;
  }

  async getAllForUser(userId: number) {
    return this.notificationRealtimeService.getAllNotificationsFromUserId(
      userId,
    );
  }

  async markAsRead(notificationId: number) {
    return this.notificationRealtimeService.markAsRead(notificationId);
  }
}
