import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  // Example: listen for 'message' events from clients
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): void {
    // Broadcast received message to all clients
    console.log('Received notification:', data);
    // this.server.emit('message', data);
  }

  @SubscribeMessage('subscribeToChannel')
  handleSubscribeToChannel(@MessageBody() channel: string): void {
    console.log(`Client subscribed to channel: ${channel}`);
    // Additional logic for managing subscriptions can be added here
  }

  // Method to emit notifications from service/controller
  sendNotification(notification: any, channel: string) {
    console.log('Sending notification to clients:', notification);
    this.server.emit(channel, JSON.stringify(notification));
  }
}
