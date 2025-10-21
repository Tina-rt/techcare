import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilisateurService {
  getHello(): string {
    return 'Hello World!';
  }
}
