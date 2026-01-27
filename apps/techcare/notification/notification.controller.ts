import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/sendNotificationDto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('test')
  testEndpoint() {
    return { message: 'Notification Service is up and running!' };
  }

  @Get('all')
  getAllNotifications() {
    return this.notificationService.getAllNotifications();
  }

  @Post('send')
  sendNotification(@Body() notifDto: SendNotificationDto) {
    return this.notificationService.sendNotification(notifDto);
  }
}
