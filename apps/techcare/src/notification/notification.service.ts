import { Inject, Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/sendNotificationDto';
import { ClientProxy } from '@nestjs/microservices';
import { sendAndCatch } from '@app/shared';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_MANAGER_SERVICE')
    private readonly notificationManagerService: ClientProxy,
  ) {}

  async sendNotification(notif: SendNotificationDto): Promise<unknown> {
    return sendAndCatch<unknown>(this.notificationManagerService, 'send_notification', notif);
  }

  async getAllNotifications(userId?: number): Promise<unknown> {
    return sendAndCatch<unknown>(
      this.notificationManagerService,
      'get_user_notifications',
      userId ?? 0,
    );
  }

  async markAsRead(notificationId: number): Promise<unknown> {
    return sendAndCatch<unknown>(
      this.notificationManagerService,
      'mark_as_read',
      notificationId,
    );
  }
}
