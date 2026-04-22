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
  async getProfile(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<Omit<User, 'password'> | null> {
    const profile = await this.authService.getProfile(req.user.userId);
    if (profile && (profile as any).address) {
      const { zipCode, ...address } = (profile as any).address;
      return {
        ...profile,
        address: {
          ...address,
          zipcode: zipCode,
        },
      } as any;
    }
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req: { user: AuthenticatedUser },
    @Body()
    body: UpdateProfileData & {
      address?: {
        street?: string;
        town?: string;
        city?: string;
        zipcode?: string;
        country?: string;
      };
    },
  ) {
    const { town, city, zipcode, ...restAddress } = body.address || {};
    const updateData = {
      ...body,
      address: body.address
        ? {
            ...restAddress,
            city: city || town,
            zipCode: zipcode,
          }
        : undefined,
    };
    return this.authService.updateProfile(req.user.userId, updateData);
  }
}
