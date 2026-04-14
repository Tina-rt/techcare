import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartDocument, Cart as CartSchema } from './schemas/cart.schema';
import {
  Cart,
  AddToCartDto,
  UpdateCartItemDto,
  RemoveFromCartDto,
} from '@app/shared';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartSchema.name) private cartModel: Model<CartDocument>,
  ) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const { userId, productId, quantity, price, name, image } = addToCartDto;

    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // New item, add to cart
      cart.items.push({ productId, quantity, price, name, image });
    }

    // Recalculate totals
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    return cart.save();
  }

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      // Return empty cart
      return new this.cartModel({ userId, items: [] });
    }
    return cart;
  }

  async updateCartItem(updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const { userId, productId, quantity } = updateCartItemDto;

    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    cart.items[itemIndex].quantity = quantity;

    // Recalculate totals
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    return cart.save();
  }

  async removeFromCart(removeFromCartDto: RemoveFromCartDto): Promise<Cart> {
    const { userId, productId } = removeFromCartDto;

    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);

    // Recalculate totals
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    return cart.save();
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;

    return cart.save();
  }
}
