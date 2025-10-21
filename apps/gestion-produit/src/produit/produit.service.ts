import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Produit, ProduitDocument } from './schemas/produit.schema';
import { Model } from 'mongoose';
import { CreerProduitDto } from './dtos/creer-produit.dto';
import { ProductFilters } from './types/filter.type';

@Injectable()
export class ProduitService {
  constructor(
    @InjectModel(Produit.name) private produitModel: Model<ProduitDocument>,
  ) {}

  async findAll(
    filters: ProductFilters = {},
    populateCategories: boolean = true,
  ): Promise<Produit[]> {
    const query: any = {};
    let baseQuery = this.produitModel.find(query);
    if (populateCategories) {
      baseQuery = baseQuery.populate({
        path: 'categorie',
        select: 'nom description',
      });
    }
    return baseQuery.exec();
  }

  async findById(id: string): Promise<ProduitDocument | null> {
    return this.produitModel.findById(id).exec();
  }

  async createProduit(produitData: CreerProduitDto): Promise<Produit> {
    const createdProduit = new this.produitModel(produitData);
    return createdProduit.save();
  }

  async updateById(
    id: string,
    updateProduitDto: CreerProduitDto,
  ): Promise<ProduitDocument | null> {
    return this.produitModel
      .findByIdAndUpdate(id, updateProduitDto, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<ProduitDocument | null> {
    return this.produitModel.findByIdAndDelete(id).exec();
  }
}
