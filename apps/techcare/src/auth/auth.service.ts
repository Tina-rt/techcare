import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { sendAndCatch, UpdateProfileData } from '@app/shared';
import * as bcrypt from 'bcrypt';
import type { User, NewUser } from '@app/database';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async signup(
    email: string,
    password: string,
    name?: string,
    firstname?: string,
    phone?: string,
  ) {
    // Check if user exists via User microservice
    const existing = await sendAndCatch<User | null>(
      this.userClient,
      'find_user_by_email',
      email,
      null,
    );
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    const newUser: NewUser = {
      email,
      password: hash,
      name,
      firstname,
      phone,
    };

    // Create user via User microservice
    const [created] = await sendAndCatch<User[]>(
      this.userClient,
      'create_user',
      newUser,
    );
    return { id: created.id, email: created.email };
  }

  async getProfile(userId: number) {
    return sendAndCatch<Omit<User, 'password'> | null>(
      this.userClient,
      'get_user_profile',
      userId,
      null,
    );
  }

  async updateProfile(userId: number, data: UpdateProfileData) {
    return sendAndCatch<User>(
      this.userClient,
      'update_profile',
      { id: userId, data },
      undefined,
    );
  }

  async signin(email: string, password: string) {
    console.log('Signin...');
    // Find user by email via User microservice
    const found = await sendAndCatch<User | null>(
      this.userClient,
      'find_user_by_email',
      email,
      null,
    );
    if (!found) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Compare password
    const valid = await bcrypt.compare(password, found.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Return JWT
    const payload = { sub: found.id, email: found.email };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
