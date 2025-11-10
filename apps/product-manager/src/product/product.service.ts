import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductFilters } from './types/filter.type';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private produitModel: Model<ProductDocument>,
    @Inject('FILE_MANAGER_SERVICE') private fileManagerClient: ClientProxy,
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

  async createProduct(
    produitData: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<Product | any> {
    let urlImage;
    const prfound = await this.produitModel
      .findOne({ serialNumber: produitData.serialNumber })
      .exec();
    if (prfound) {
      throw new ConflictException(
        'Product with this serial number already exists',
      );
    }
    try {
      const { url } = await lastValueFrom(
        this.fileManagerClient.send('upload_file', image),
      );
      urlImage = url;
    } catch (error) {
      console.log('Erreur uploading images', error);
    }

    const createdProduct = new this.produitModel({
      ...produitData,
      image: urlImage ?? '',
    });
    // return { data: 'ok' };
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
