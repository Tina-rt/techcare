import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { email: string; password: string }) {
    return this.authService.signup(body.email, body.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    return this.authService.signin(body.email, body.password);
  }
}
