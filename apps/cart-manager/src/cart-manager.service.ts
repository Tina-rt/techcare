import { Injectable } from '@nestjs/common';

@Injectable()
export class CartManagerService {
  getHello(): string {
    return 'Hello from Cart Manager!';
  }
}
