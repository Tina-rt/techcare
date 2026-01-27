import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryManagerService {
  getHello(): string {
    return 'Hello World!';
  }
}
