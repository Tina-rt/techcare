import { Controller } from '@nestjs/common';
import { NotificationManagerService } from './notification-manager.service';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
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

  @EventPattern('order_status_updated')
  async handleOrderStatusUpdated(@Payload() data: { userId: number | string; orderId: string | number; status: string }) {
    console.log('[NOTIFICATION_MANAGER] Intercepted order_status_updated:', data);
    const orderStatusMap: Record<string, string> = {
      pending: 'en attente',
      processing: 'en cours de traitement',
      confirmed: 'confirmée',
      shipped: 'expédiée',
      delivered: 'livrée',
      cancelled: 'annulée',
    };
    
    const statusLabel = orderStatusMap[data.status?.toLowerCase()] || data.status;

    return this.notificationManagerService.sendNotification({
      title: 'Mise à jour de votre commande',
      message: `Le statut de votre commande #${data.orderId} est passé à : ${statusLabel}.`,
      userId: Number(data.userId),
      read: false,
      createdAt: new Date(),
    });
  }

  @MessagePattern('get_user_notifications')
  async handleGetUserNotifications(@Payload() userId: number) {
    return this.notificationManagerService.getAllForUser(userId);
  }

  @MessagePattern('mark_as_read')
  async handleMarkAsRead(@Payload() notificationId: number) {
    return this.notificationManagerService.markAsRead(notificationId);
  }
}
