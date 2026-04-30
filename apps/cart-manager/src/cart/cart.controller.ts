import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  RemoveFromCartDto,
} from '@app/shared';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'add_to_cart' })
  async addToCart(@Payload() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(addToCartDto);
  }

  @MessagePattern({ cmd: 'get_cart' })
  async getCart(@Payload() data: { userId: number | string }) {
    return this.cartService.getCart(Number(data.userId));
  }

  @MessagePattern({ cmd: 'update_cart_item' })
  async updateCartItem(@Payload() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(updateCartItemDto);
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  async removeFromCart(@Payload() removeFromCartDto: RemoveFromCartDto) {
    return this.cartService.removeFromCart(removeFromCartDto);
  }

  @MessagePattern({ cmd: 'clear_cart' })
  async clearCart(@Payload() data: { userId: number | string }) {
    return this.cartService.clearCart(Number(data.userId));
  }
}
