import { Injectable } from '@nestjs/common';

@Injectable()
export class GestionProduitService {
  getHello(): string {
    return 'Hello World!';
  }
}
