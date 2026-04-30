import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/sendNotificationDto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationGateway } from './notification.gateway';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get('test')
  testEndpoint() {
    return { message: 'Notification Service is up and running!' };
  }

  @Get('all')
  getAllNotifications(@Query('userId') userId?: string) {
    return this.notificationService.getAllNotifications(userId ? parseInt(userId, 10) : undefined);
  }

  @Post('send')
  sendNotification(@Body() notifDto: SendNotificationDto) {
    return this.notificationService.sendNotification(notifDto);
  }

  @Put('read/:id')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(parseInt(id, 10));
  }

  @EventPattern('notification_created')
  handleNotificationCreated(@Payload() data: any) {
    if (data && data.userId) {
      this.notificationGateway.sendNotification(data, data.userId);
    }
  }
}
