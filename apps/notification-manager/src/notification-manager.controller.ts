import { Controller, Get } from '@nestjs/common';
import { NotificationManagerService } from './notification-manager.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class NotificationManagerController {
  constructor(
    private readonly notificationManagerService: NotificationManagerService,
  ) {}

  @MessagePattern('send_notification')
  async handleSendNotification(data: any) {
    console.log(
      '[NOTIFICATION_MANAGER] Received send_notification message with data:',
      data,
    );
    // this.notificationManagerService.sendRealTimeNotification(data);
    // const notif = data as { type: string; message: string; recipientId: string };
    return 'OK';
  }
}
