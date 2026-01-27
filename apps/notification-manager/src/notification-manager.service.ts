import { Inject, Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification-realtime/notification.gateway';

@Injectable()
export class NotificationManagerService {
  constructor(private readonly notificationGateway: NotificationGateway) {}
  sendRealTimeNotification(message: string, channel: string) {
    this.notificationGateway.sendNotification(message, channel);
  }
}
