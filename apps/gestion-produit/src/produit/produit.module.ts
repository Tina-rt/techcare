import { Module } from '@nestjs/common';
import { ProduitController } from './produit.controller';
import { ProduitService } from './produit.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Produit, ProduitSchema } from './schemas/produit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Produit.name, schema: ProduitSchema }]),
  ],
  controllers: [ProduitController],
  providers: [ProduitService],
})
export class ProduitModule {}
