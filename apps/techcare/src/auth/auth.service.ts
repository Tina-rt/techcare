import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, defaultIfEmpty } from 'rxjs';
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
    const existing = await lastValueFrom(
      this.userClient
        .send<User>('find_user_by_email', email)
        .pipe(defaultIfEmpty(null)),
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
    const [created] = await lastValueFrom(
      this.userClient.send<User[]>('create_user', newUser),
    );
    return { id: created.id, email: created.email };
  }

  async updateProfile(
    userId: number,
    data: {
      name?: string;
      firstname?: string;
      phone?: string;
      address?: {
        street?: string;
        city?: string;
        country?: string;
      };
    },
  ) {
    return lastValueFrom(
      this.userClient
        .send('update_profile', { id: userId, data })
        .pipe(defaultIfEmpty(null)),
    );
  }

  async signin(email: string, password: string) {
    console.log('Signin...');
    // Find user by email via User microservice
    const found = await lastValueFrom(
      this.userClient
        .send<User>('find_user_by_email', email)
        .pipe(defaultIfEmpty(null)),
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
