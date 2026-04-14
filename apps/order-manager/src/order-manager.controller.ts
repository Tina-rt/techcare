import { Controller, Get } from '@nestjs/common';
import { OrderManagerService } from './order-manager.service';

@Controller()
export class OrderManagerController {
  constructor(private readonly orderManagerService: OrderManagerService) {}

  @Get()
  getHello(): string {
    return this.orderManagerService.getHello();
  }
}
