import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schema';
import { DATABASE_CONNECTION } from '@app/database';
import {
  settings,
  type Settings,
  type NewSettings,
} from '@app/database/schema';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getSettings(): Promise<Settings> {
    const [config] = await this.db
      .select()
      .from(settings)
      .where(eq(settings.id, 1));

    if (!config) {
      // Return default empty settings if not found
      return {
        id: 1,
        shippingFee: 0,
        supportLocation: '',
        supportPhone: '',
        supportEmail: '',
        termsAndConditions: '',
        privacyPolicy: '',
        socials: '{}',
        logo: '',
        updatedAt: new Date(),
      };
    }

    return config;
  }

  async updateSettings(data: Partial<NewSettings>): Promise<Settings> {
    const { id, updatedAt, ...cleanData } = data;

    const [existing] = await this.db
      .select()
      .from(settings)
      .where(eq(settings.id, 1));

    if (existing) {
      const [updated] = await this.db
        .update(settings)
        .set({ ...cleanData, updatedAt: new Date() })
        .where(eq(settings.id, 1))
        .returning();
      return updated;
    } else {
      const [created] = await this.db
        .insert(settings)
        .values({ ...cleanData, id: 1, updatedAt: new Date() })
        .returning();
      return created;
    }
  }
}
