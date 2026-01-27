import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthMeController } from './auth-me.controller';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '@app/database';

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'changeme',
			signOptions: { expiresIn: '1d' },
		}),
		DatabaseModule,
	],
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController, AuthMeController],
})
export class AuthModule {}
