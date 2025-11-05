import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductFilters } from './types/filter.type';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private produitModel: Model<ProductDocument>,
  ) {}

  async findAll(
    filters: ProductFilters = {},
    populateCategorys: boolean = true,
  ): Promise<Product[]> {
    const query: any = {};
    let baseQuery = this.produitModel.find(query);
    if (populateCategorys) {
      baseQuery = baseQuery.populate({
        path: 'category',
        select: 'name description',
      });
    }
    return baseQuery.exec();
  }

  async findById(id: string): Promise<ProductDocument | null> {
    return this.produitModel.findById(id).exec();
  }

  async createProduct(produitData: CreateProductDto): Promise<Product> {
    const createdProduct = new this.produitModel(produitData);
    return createdProduct.save();
  }

  async updateById(
    id: string,
    updateProductDto: CreateProductDto,
  ): Promise<ProductDocument | null> {
    return this.produitModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<ProductDocument | null> {
    return this.produitModel.findByIdAndDelete(id).exec();
  }
}
