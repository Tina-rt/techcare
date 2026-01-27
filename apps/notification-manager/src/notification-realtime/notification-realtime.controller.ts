import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationRealtimeService } from './notification-realtime.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { notification } from '@app/database/schema';

@Controller('notification-realtime')
export class NotificationRealtimeController {
  constructor(
    private readonly notificationRealtimeService: NotificationRealtimeService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get()
  getAllNotifications() {
    return this.notificationRealtimeService.getAllNotifications();
  }

  @Get(':userId')
  getAllNotificationsFromUserId(@Param('userId') userId: string) {
    return this.notificationRealtimeService.getAllNotificationsFromUserId(
      userId,
    );
  }

  @Post()
  createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    console.log('Creating notification:', createNotificationDto);
    const newNotif = this.notificationRealtimeService.createNotification(
      createNotificationDto,
    );
    newNotif.then((data) => {
      this.notificationGateway.sendNotification(data, 'notifications');
    });
    return newNotif;
  }
}
