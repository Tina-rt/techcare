import { Controller, Get } from '@nestjs/common';
import { GestionProduitService } from './gestion-produit.service';

@Controller()
export class GestionProduitController {
  constructor(private readonly gestionProduitService: GestionProduitService) {}

  @Get()
  getHello(): string {
    return this.gestionProduitService.getHello();
  }
}
