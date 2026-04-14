import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBSOCKET = 'WEBSOCKET',
}

export class SendNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  userId?: string | number;
}
