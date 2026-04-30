import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from '@app/database/schema';
import { blogPosts, type BlogPost, type NewBlogPost } from '@app/database/schema';
import { DATABASE_CONNECTION } from '@app/database';

@Injectable()
export class BlogService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getAll(publishedOnly = true): Promise<BlogPost[]> {
    const query = publishedOnly
      ? this.db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.published, true))
          .orderBy(desc(blogPosts.publishedAt))
      : this.db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

    return query;
  }

  async getById(id: number): Promise<BlogPost> {
    const [post] = await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    if (!post) throw new NotFoundException(`Blog post #${id} not found`);
    return post;
  }

  async getBySlug(slug: string): Promise<BlogPost> {
    const [post] = await this.db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)));
    if (!post) throw new NotFoundException(`Blog post "${slug}" not found`);
    return post;
  }

  async create(data: NewBlogPost): Promise<BlogPost> {
    const slug = data.slug || this.generateSlug(data.title);
    const [created] = await this.db
      .insert(blogPosts)
      .values({
        ...data,
        slug,
        publishedAt: data.published ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async update(id: number, data: Partial<NewBlogPost>): Promise<BlogPost> {
    const { id: _, createdAt, updatedAt, ...cleanData } = data as any;
    const extra: any = { updatedAt: new Date() };
    if (cleanData.published && !cleanData.publishedAt) {
      // Set publishedAt on first publish
      const existing = await this.getById(id);
      if (!existing.publishedAt) extra.publishedAt = new Date();
    }
    const [updated] = await this.db
      .update(blogPosts)
      .set({ ...cleanData, ...extra })
      .where(eq(blogPosts.id, id))
      .returning();
    if (!updated) throw new NotFoundException(`Blog post #${id} not found`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') + '-' + Date.now();
  }
}
