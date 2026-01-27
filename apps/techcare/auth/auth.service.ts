import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DATABASE_CONNECTION } from '@app/database';
import { user as userTable, NewUser } from '@app/database';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string) {
    // Check if user exists
    const existing = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    if (existing.length > 0) {
      throw new ConflictException('Email already in use');
    }
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    const newUser: NewUser = { email, password: hash };
    const [created] = await this.db
      .insert(userTable)
      .values(newUser)
      .returning();
    return { id: created.id, email: created.email };
  }

  async signin(email: string, password: string) {
    // Find user by email
    const users = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    const found = users[0];
    if (!found) {
      return { message: 'Invalid credentials' };
    }
    // Compare password
    const valid = await bcrypt.compare(password, found.password);
    if (!valid) {
      return { message: 'Invalid credentials' };
    }
    // Return JWT
    const payload = { sub: found.id, email: found.email };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
