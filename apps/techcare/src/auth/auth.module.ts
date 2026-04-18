import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthMeController } from './auth-me.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'user_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController, AuthMeController],
})
export class AuthModule {}
