import { Inject, Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/sendNotificationDto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_MANAGER_SERVICE')
    private readonly notificationManagerService: ClientProxy,
  ) {}

  async sendNotification(notif: SendNotificationDto): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.notificationManagerService.send('send_notification', notif),
    );
  }

  async getAllNotifications(userId?: number): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.notificationManagerService.send(
        'get_user_notifications',
        userId ?? 0,
      ),
    );
  }
}
