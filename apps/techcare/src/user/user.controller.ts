import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Res,
  Inject,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { sendAndCatch, convertToCsv } from '@app/shared';
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

  @Get('export/customer')
  @UseGuards(JwtAuthGuard)
  async exportCustomers(@Res() res: Response) {
    const customers = await sendAndCatch<User[]>(
      this.userClient,
      'find_all_users',
      'USER',
    );

    const csv = convertToCsv(customers, [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Nom' },
      { field: 'firstname', header: 'Prénom' },
      { field: 'email', header: 'Email' },
      { field: 'phone', header: 'Téléphone' },
      { field: 'address.street', header: 'Rue' },
      { field: 'address.city', header: 'Ville' },
      { field: 'address.zipCode', header: 'Code Postal' },
      { field: 'address.country', header: 'Pays' },
      { field: 'createdAt', header: 'Date Inscription' },
    ]);

    res.header('Content-Type', 'text/csv');
    res.attachment(`customers_${new Date().getTime()}.csv`);
    return res.send(csv);
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
    return sendAndCatch<User>(this.userClient, 'update_user', {
      id: Number(id),
      data: updateData,
    });
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
