import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductManagerService {
  getHello(): string {
    return 'Hello World!';
  }
}
