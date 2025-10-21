import { Module } from '@nestjs/common';
import { GestionProduitController } from './gestion-produit.controller';
import { GestionProduitService } from './gestion-produit.service';
import { ProduitModule } from './produit/produit.module';
import { StockModule } from './stock/stock.module';
import { CategoriesModule } from './categories/categories.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://root:example@localhost:27017/gestion-produit?authSource=admin',
    ),
    ProduitModule,
    StockModule,
    CategoriesModule,
  ],
  controllers: [GestionProduitController],
  providers: [GestionProduitService],
})
export class GestionProduitModule {}
