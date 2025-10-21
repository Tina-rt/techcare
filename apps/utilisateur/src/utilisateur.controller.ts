import { Controller, Get } from '@nestjs/common';
import { UtilisateurService } from './utilisateur.service';

@Controller()
export class UtilisateurController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  @Get()
  getHello(): string {
    return this.utilisateurService.getHello();
  }
}
