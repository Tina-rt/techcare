import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Product, CreateProductDto, ProductFiltersDto } from '@app/shared';
import { FileService } from '../file/file.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
    private readonly fileService: FileService,
  ) {}

  async findAll(filters: ProductFiltersDto = {}): Promise<Product[]> {
    return lastValueFrom(
      this.productClient.send<Product[]>('find_all_products', filters),
    );
  }

  async search(
    keyword: string,
    filters: ProductFiltersDto = {},
  ): Promise<Product[]> {
    return lastValueFrom(
      this.productClient.send<Product[]>('search_products', {
        keyword,
        ...filters,
      }),
    );
  }

  async findById(id: string): Promise<Product> {
    return lastValueFrom(
      this.productClient.send<Product>('find_product_by_id', id),
    );
  }

  async create(
    data: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<Product> {
    console.log('Creating products', data);
    console.log('Images', image);
    let imageUrl = '';
    if (image) {
      const uploadResult = await this.fileService.uploadFile(image, 'products');
      imageUrl = uploadResult.url;
    }

    return lastValueFrom(
      this.productClient.send<Product>('create_product', {
        ...data,
        image: imageUrl,
      }),
    );
  }

  async update(id: string, data: CreateProductDto): Promise<Product> {
    return lastValueFrom(
      this.productClient.send<Product>('update_product', { id, data }),
    );
  }

  async delete(id: string): Promise<Product> {
    return lastValueFrom(
      this.productClient.send<Product>('delete_product', id),
    );
  }
}
