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
import { AuthenticatedUser, UpdateProfileData } from '@app/shared';
import type { User } from '@app/database';

@Controller('auth')
export class AuthMeController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: { user: AuthenticatedUser }): Promise<Omit<User, 'password'> | null> {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req: { user: AuthenticatedUser },
    @Body() body: UpdateProfileData & { address?: { street?: string; town?: string; country?: string } },
  ) {
    const { town, ...restAddress } = body.address || {};
    const updateData = {
      ...body,
      address: body.address
        ? { ...restAddress, city: town }
        : undefined,
    };
    return this.authService.updateProfile(req.user.userId, updateData);
  }
}
