import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@app/database/schema';
import { carts } from '@app/database/schema';
import { DATABASE_CONNECTION } from '@app/database';
import {
  Cart,
  AddToCartDto,
  UpdateCartItemDto,
  RemoveFromCartDto,
  CartItem,
} from '@app/shared';

@Injectable()
export class CartService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const { userId, productId, quantity, price, name, image } = addToCartDto;

    // Upsert: create cart if not existing
    await this.db
      .insert(carts)
      .values({
        userId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      })
      .onConflictDoNothing();

    const [existing] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    const items = [...(existing.items as CartItem[])];
    const itemIndex = items.findIndex((i) => i.productId === productId);

    if (itemIndex > -1) {
      items[itemIndex].quantity += quantity;
    } else {
      items.push({ productId, quantity, price, name, image });
    }

    const totalAmount = items.reduce((t, i) => t + i.price * i.quantity, 0);
    const totalItems = items.reduce((t, i) => t + i.quantity, 0);

    const [updated] = await this.db
      .update(carts)
      .set({ items, totalAmount, totalItems, updatedAt: new Date() })
      .where(eq(carts.userId, userId))
      .returning();

    return this.toCart(updated);
  }

  async getCart(userId: string): Promise<Cart> {
    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) {
      return { userId, items: [], totalAmount: 0, totalItems: 0 };
    }
    return this.toCart(cart);
  }

  async updateCartItem(updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const { userId, productId, quantity } = updateCartItemDto;
    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) throw new NotFoundException('Cart not found');

    const items = (cart.items as CartItem[]).map((i) =>
      i.productId === productId ? { ...i, quantity } : i,
    );

    const found = (cart.items as CartItem[]).findIndex(
      (i) => i.productId === productId,
    );
    if (found === -1) throw new NotFoundException('Item not found in cart');

    const totalAmount = items.reduce((t, i) => t + i.price * i.quantity, 0);
    const totalItems = items.reduce((t, i) => t + i.quantity, 0);

    const [updated] = await this.db
      .update(carts)
      .set({ items, totalAmount, totalItems, updatedAt: new Date() })
      .where(eq(carts.userId, userId))
      .returning();

    return this.toCart(updated);
  }

  async removeFromCart(removeFromCartDto: RemoveFromCartDto): Promise<Cart> {
    const { userId, productId } = removeFromCartDto;
    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) throw new NotFoundException('Cart not found');

    const items = (cart.items as CartItem[]).filter(
      (i) => i.productId !== productId,
    );
    const totalAmount = items.reduce((t, i) => t + i.price * i.quantity, 0);
    const totalItems = items.reduce((t, i) => t + i.quantity, 0);

    const [updated] = await this.db
      .update(carts)
      .set({ items, totalAmount, totalItems, updatedAt: new Date() })
      .where(eq(carts.userId, userId))
      .returning();

    return this.toCart(updated);
  }

  async clearCart(userId: string): Promise<Cart> {
    const [existing] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!existing) throw new NotFoundException('Cart not found');

    const [updated] = await this.db
      .update(carts)
      .set({ items: [], totalAmount: 0, totalItems: 0, updatedAt: new Date() })
      .where(eq(carts.userId, userId))
      .returning();

    return this.toCart(updated);
  }

  private toCart(row: typeof carts.$inferSelect): Cart {
    return {
      userId: row.userId,
      items: (row.items as CartItem[]) ?? [],
      totalAmount: row.totalAmount,
      totalItems: row.totalItems,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
