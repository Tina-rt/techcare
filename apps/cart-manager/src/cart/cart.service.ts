import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schema';
import { carts } from '@app/database/schema';
import { DATABASE_CONNECTION } from '@app/database';
import { ClientProxy } from '@nestjs/microservices';
import {
  Cart,
  AddToCartDto,
  UpdateCartItemDto,
  RemoveFromCartDto,
  CartItem,
  Product,
  sendAndCatch,
} from '@app/shared';

@Injectable()
export class CartService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const { userId, productId, quantity } = addToCartDto;

    // Fetch product info to ensure it exists and get verified price/name
    const product = await sendAndCatch<Product>(
      this.productClient,
      'find_product_by_id',
      productId,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.active) {
      throw new BadRequestException('Product is not currently available');
    }

    const { price, name, image, reduction } = product;

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
      // Update price/name/image/reduction in case they changed since last add
      items[itemIndex].price = price;
      items[itemIndex].name = name;
      items[itemIndex].image = image;
      items[itemIndex].reduction = reduction;
    } else {
      items.push({ productId, quantity, price, name, image, reduction });
    }

    const totalAmount = Math.round(
      items.reduce(
        (t, i) => t + i.price * (1 - (i.reduction ?? 0) / 100) * i.quantity,
        0,
      ),
    );
    const totalItems = items.reduce((t, i) => t + i.quantity, 0);

    const [updated] = await this.db
      .update(carts)
      .set({ items, totalAmount, totalItems, updatedAt: new Date() })
      .where(eq(carts.userId, userId))
      .returning();

    return this.toCart(updated);
  }

  async getCart(userId: number): Promise<Cart> {
    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) {
      return { userId, items: [], totalAmount: 0, totalItems: 0 };
    }

    // Fetch products to verify live stock
    let products: Product[] = [];
    try {
      products = await sendAndCatch<Product[]>(
        this.productClient,
        'find_all_products',
        {},
      );
    } catch (e) {
      console.error('[CartManager] Error fetching products stock:', e);
    }

    const items = (cart.items as CartItem[]) ?? [];
    let totalAmount = 0;
    let totalItems = 0;

    const processedItems = items.map((item) => {
      const product = products.find(
        (p) => String(p._id) === String(item.productId),
      );
      const isOutOfStock =
        !product ||
        (product.quantity !== undefined
          ? product.quantity
          : (product as any).stock) <= 0;

      if (!isOutOfStock) {
        const basePrice = item.price ?? product?.price ?? 0;
        const reduction = item.reduction ?? product?.reduction ?? 0;
        totalAmount += Math.round(
          basePrice * (1 - reduction / 100) * item.quantity,
        );
        totalItems += item.quantity;
      }

      return {
        ...item,
        isOutOfStock,
      };
    });

    return {
      userId: cart.userId,
      items: processedItems as any,
      totalAmount,
      totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
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

    const totalAmount = Math.round(
      items.reduce(
        (t, i) => t + i.price * (1 - (i.reduction ?? 0) / 100) * i.quantity,
        0,
      ),
    );
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
    const totalAmount = Math.round(
      items.reduce(
        (t, i) => t + i.price * (1 - (i.reduction ?? 0) / 100) * i.quantity,
        0,
      ),
    );
    const totalItems = items.reduce((t, i) => t + i.quantity, 0);

    const [updated] = await this.db
      .update(carts)
      .set({ items, totalAmount, totalItems, updatedAt: new Date() })
      .where(eq(carts.userId, userId))
      .returning();

    return this.toCart(updated);
  }

  async clearCart(userId: number): Promise<Cart> {
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
