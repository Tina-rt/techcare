import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ProduitService } from './produit.service';
import { CreerProduitDto } from './dtos/creer-produit.dto';

@Controller('produit')
export class ProduitController {
  constructor(private readonly produitService: ProduitService) {}

  @Get()
  getAllProduits() {
    return this.produitService.findAll();
  }

  @Get(':id')
  getProduitById(@Param('id') id: string) {
    return this.produitService.findById(id);
  }

  @Post()
  createProduit(@Body() creerProduitDto: CreerProduitDto) {
    return this.produitService.createProduit(creerProduitDto);
  }

  @Put(':id')
  updateProduit(
    @Param('id') id: string,
    @Body() updateProduitDto: CreerProduitDto,
  ) {
    return this.produitService.updateById(id, updateProduitDto);
  }
}
