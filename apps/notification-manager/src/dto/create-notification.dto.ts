import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  createdAt: Date;

  @IsBoolean()
  read: boolean;

  @IsString()
  userId: number | string;
}
