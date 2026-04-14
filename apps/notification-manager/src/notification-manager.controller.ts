import { Controller } from '@nestjs/common';
import { NotificationManagerService } from './notification-manager.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller()
export class NotificationManagerController {
  constructor(
    private readonly notificationManagerService: NotificationManagerService,
  ) {}

  @MessagePattern('send_notification')
  async handleSendNotification(@Payload() data: CreateNotificationDto) {
    console.log('[NOTIFICATION_MANAGER] Creating notification:', data);
    return this.notificationManagerService.sendNotification(data);
  }

  @MessagePattern('get_user_notifications')
  async handleGetUserNotifications(@Payload() userId: number) {
    return this.notificationManagerService.getAllForUser(userId);
  }
}
