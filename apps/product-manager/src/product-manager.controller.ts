import { Controller, Get } from '@nestjs/common';
import { ProductManagerService } from './product-manager.service';

@Controller()
export class ProductManagerController {
  constructor(private readonly ProductManagerService: ProductManagerService) {}

  @Get()
  getHello(): string {
    return this.ProductManagerService.getHello();
  }
}
