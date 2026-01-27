import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { DATABASE_CONNECTION } from '@app/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
// import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import * as schema from '@app/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class NotificationRealtimeService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  createNotification(notification: CreateNotificationDto) {
    return this.db
      .insert(schema.notification)
      .values({
        title: notification.title,
        message: notification.message,
        userId:
          typeof notification.userId === 'string'
            ? parseInt(notification.userId, 10)
            : notification.userId,
        read: false,
        createdAt: new Date(),
      })
      .returning();
  }

  getAllNotificationsFromUserId(userId: number | string) {
    return this.db
      .select()
      .from(schema.notification)
      .where(eq(schema.notification.userId, +userId));
  }

  getAllNotifications() {
    return this.db.select().from(schema.notification);
  }

  //   markAsRead(notificationId: number) {
  //     return this.prisma.notification.update({
  //       where: { id: notificationId },
  //       data: { read: true },
  //     });
  //   }
}
