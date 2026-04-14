import { Controller, Get } from '@nestjs/common';
import { PaymentManagerService } from './payment-manager.service';

@Controller()
export class PaymentManagerController {
  constructor(private readonly paymentManagerService: PaymentManagerService) {}

  @Get()
  getHello(): string {
    return this.paymentManagerService.getHello();
  }
}
