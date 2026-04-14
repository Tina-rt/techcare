import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthMeController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: { user: { sub: number; email: string } }): any {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req: { user: { sub: number; email: string } },
    @Body()
    body: {
      name?: string;
      firstname?: string;
      phone?: string;
      address?: {
        street?: string;
        town?: string;
        country?: string;
      };
    },
  ) {
    const { town, ...restAddress } = body.address || {};
    const updateData = {
      ...body,
      address: body.address
        ? { ...restAddress, city: town }
        : undefined,
    };
    return this.authService.updateProfile(req.user.sub, updateData);
  }
}
