import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categorie, CategorieDocument } from './schemas/categorie.schema';
import { Model } from 'mongoose';
import { CreerCategorieDto } from './dtos/creer-categorie.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categorie.name)
    private categorieModel: Model<CategorieDocument>,
  ) {}

  async create(categorieDto: CreerCategorieDto): Promise<Categorie> {
    const createdCategorie = new this.categorieModel(categorieDto);
    return createdCategorie.save();
  }

  async findAll(): Promise<Categorie[]> {
    return this.categorieModel.find().exec();
  }

  async findById(id: string): Promise<CategorieDocument | null> {
    return this.categorieModel.findById(id).exec();
  }

  async deleteById(id: string): Promise<CategorieDocument | null> {
    return this.categorieModel.findByIdAndDelete(id).exec();
  }

  async updateById(
    id: string,
    updateCategorieDto: CreerCategorieDto,
  ): Promise<CategorieDocument | null> {
    return this.categorieModel
      .findByIdAndUpdate(id, updateCategorieDto, { new: true })
      .exec();
  }
}
