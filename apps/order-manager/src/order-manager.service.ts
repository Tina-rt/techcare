import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderManagerService {
  getHello(): string {
    return 'Hello from Order Manager!';
  }
}
