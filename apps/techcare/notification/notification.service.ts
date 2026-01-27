import { Inject, Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/sendNotificationDto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_MANAGER_SERVICE')
    private notificationManagerService: ClientProxy,
  ) {}

  sendNotification(notif: SendNotificationDto): string {
    this.notificationManagerService.emit('send_notification', notif);
    return `Notification of type ${notif.type} sent with message: ${notif.message}`;
  }
}
