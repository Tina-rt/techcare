import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentManagerService {
  getHello(): string {
    return 'Hello from Payment Manager!';
  }
}
