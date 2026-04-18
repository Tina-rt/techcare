import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AddToCartDto,
  UpdateCartItemDto,
  RemoveFromCartDto,
  Cart,
} from '@app/shared';

@Controller('cart')
export class CartController {
  constructor(
    @Inject('CART_MANAGER_SERVICE')
    private readonly cartClient: ClientProxy,
  ) {}

  @Post('add')
  async addToCart(@Body() body: AddToCartDto): Promise<Cart> {
    return firstValueFrom<Cart>(
      this.cartClient.send({ cmd: 'add_to_cart' }, body),
    );
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: string): Promise<Cart> {
    return firstValueFrom<Cart>(
      this.cartClient.send({ cmd: 'get_cart' }, { userId }),
    );
  }

  @Put('update')
  async updateCartItem(@Body() body: UpdateCartItemDto): Promise<Cart> {
    return firstValueFrom<Cart>(
      this.cartClient.send({ cmd: 'update_cart_item' }, body),
    );
  }

  @Delete('remove')
  async removeFromCart(@Body() body: RemoveFromCartDto): Promise<Cart> {
    return firstValueFrom<Cart>(
      this.cartClient.send({ cmd: 'remove_from_cart' }, body),
    );
  }

  @Delete('clear/:userId')
  async clearCart(@Param('userId') userId: string): Promise<Cart> {
    return firstValueFrom<Cart>(
      this.cartClient.send({ cmd: 'clear_cart' }, { userId }),
    );
  }
}
