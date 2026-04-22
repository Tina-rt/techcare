import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@app/database';
import {
  user as userTable,
  address as addressTable,
  User,
  NewUser,
} from '@app/database';
import * as schema from '@app/database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(role?: 'USER' | 'ADMIN') {
    return this.db.query.user.findMany({
      where: role ? eq(userTable.role, role) : undefined,
      with: {
        address: true,
      },
    });
  }

  async findByEmail(email: string) {
    try {
      return this.db.query.user.findFirst({
        where: eq(userTable.email, email),
        with: {
          address: true,
        },
      });
    } catch {
      return undefined;
    }
  }

  async findById(id: number) {
    return this.db.query.user.findFirst({
      where: eq(userTable.id, id),
      with: {
        address: true,
      },
    });
  }

  async getUserProfile(id: number) {
    const userProfile = await this.db.query.user.findFirst({
      where: eq(userTable.id, id),
      with: {
        address: true,
      },
    });
    if (!userProfile) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = userProfile;
    return result;
  }

  async create(data: NewUser) {
    return this.db.insert(userTable).values(data).returning();
  }

  async update(id: number, data: Partial<NewUser>) {
    return this.db
      .update(userTable)
      .set(data)
      .where(eq(userTable.id, id))
      .returning();
  }

  async delete(id: number) {
    return this.db.delete(userTable).where(eq(userTable.id, id)).returning();
  }

  async updateProfile(
    userId: number,
    data: {
      name?: string;
      firstname?: string;
      phone?: string;
      address?: { street?: string; city?: string; country?: string };
    },
  ) {
    const { address, ...userData } = data;

    // Update user info
    if (Object.keys(userData).length > 0) {
      await this.db
        .update(userTable)
        .set(userData)
        .where(eq(userTable.id, userId));
    }

    // Update or Create address
    if (address) {
      const existingAddress = await this.db
        .select()
        .from(addressTable)
        .where(eq(addressTable.userId, userId));

      if (existingAddress.length > 0) {
        await this.db
          .update(addressTable)
          .set(address)
          .where(eq(addressTable.userId, userId));
      } else {
        await this.db.insert(addressTable).values({
          ...address,
          city: address.city || '', // city is notNull in schema
          country: address.country || '', // country is notNull in schema
          userId,
        });
      }
    }

    return this.findById(userId);
  }
}
