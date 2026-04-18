import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { sendAndCatch } from '@app/shared';
import type { User, NewUser } from '@app/database';
import * as bcrypt from 'bcrypt';

@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async getAllAdmins() {
    return sendAndCatch<User[]>(this.userClient, 'find_all_users', 'ADMIN');
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  async createAdmin(@Body() body: any) {
    const { password, ...rest } = body;
    const hash = await bcrypt.hash(password, 10);
    const newUser: NewUser = {
      ...rest,
      password: hash,
      role: 'ADMIN',
    };
    return sendAndCatch<User>(this.userClient, 'create_user', newUser);
  }

  @Patch('admin')
  @UseGuards(JwtAuthGuard)
  async updateAdmin(@Body() body: any) {
    const { id, password, ...data } = body;
    const updateData: Partial<NewUser> = { ...data };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    return sendAndCatch<User>(
      this.userClient,
      'update_user',
      { id: Number(id), data: updateData },
    );
  }

  @Post('email-valid')
  async checkEmailValid(@Body('email') email: string) {
    const user = await sendAndCatch<User | null>(
      this.userClient,
      'find_user_by_email',
      email,
      null,
    );
    return { valid: !user };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return sendAndCatch<User>(this.userClient, 'find_user_by_id', Number(id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string) {
    return sendAndCatch<User>(this.userClient, 'delete_user', Number(id));
  }
}
