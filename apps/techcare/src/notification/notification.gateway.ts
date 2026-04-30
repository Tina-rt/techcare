import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribeToChannel')
  handleSubscribeToChannel(
    @MessageBody() userId: string | number,
    @ConnectedSocket() client: Socket,
  ): void {
    const channel = `user-${userId}`;
    client.join(channel);
    this.logger.log(`Client ${client.id} subscribed to channel: ${channel}`);
  }

  // Method to emit notifications from service/controller
  sendNotification(notification: any, userId: string | number): void {
    const channel = `user-${userId}`;
    this.logger.log(`Sending notification to ${channel}`);
    this.server.to(channel).emit('new_notification', notification);
  }
}
