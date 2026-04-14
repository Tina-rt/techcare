import { Controller, Get } from '@nestjs/common';
import { CartManagerService } from './cart-manager.service';

@Controller()
export class CartManagerController {
  constructor(private readonly cartManagerService: CartManagerService) {}

  @Get()
  getHello(): string {
    return this.cartManagerService.getHello();
  }
}
