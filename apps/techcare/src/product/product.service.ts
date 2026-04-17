import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Product, CreateProductDto, ProductFiltersDto, sendAndCatch } from '@app/shared';
import { FileService } from '../file/file.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
    @Inject('INVENTORY_MANAGER_SERVICE')
    private readonly inventoryClient: ClientProxy,
    private readonly fileService: FileService,
  ) {}

  async findAll(filters: ProductFiltersDto = {}): Promise<Product[]> {
    const products = await sendAndCatch<Product[]>(
      this.productClient,
      'find_all_products',
      filters,
    );
    return this.aggregateStock(products);
  }

  async search(
    keyword: string,
    filters: ProductFiltersDto = {},
  ): Promise<Product[]> {
    const products = await sendAndCatch<Product[]>(
      this.productClient,
      'search_products',
      {
        keyword,
        ...filters,
      },
    );
    return this.aggregateStock(products);
  }

  async findById(id: string): Promise<Product> {
    const product = await sendAndCatch<Product>(
      this.productClient,
      'find_product_by_id',
      id,
    );
    const stock = await sendAndCatch<any>(this.inventoryClient, 'get_stock', id);
    return {
      ...product,
      quantity: stock?.quantity ?? 0,
    };
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

    return sendAndCatch<Product>(this.productClient, 'create_product', {
      ...data,
      image: imageUrl,
    });
  }

  async update(id: string, data: CreateProductDto): Promise<Product> {
    return sendAndCatch<Product>(this.productClient, 'update_product', { id, data });
  }

  async delete(id: string): Promise<Product> {
    return sendAndCatch<Product>(this.productClient, 'delete_product', id);
  }

  private async aggregateStock(products: Product[]): Promise<Product[]> {
    if (!products.length) return [];

    try {
      const inventory = await sendAndCatch<any[]>(
        this.inventoryClient,
        'find_all_inventory',
        {},
      );

      const stockMap = new Map(
        inventory.map((item) => [item.productId, item.quantity]),
      );

      return products.map((product) => ({
        ...product,
        quantity: stockMap.get((product as any)._id?.toString()) ?? 0,
      }));
    } catch (error) {
      console.error('Failed to aggregate stock:', error);
      // Fallback: return products with 0 quantity if inventory service is unavailable
      return products.map((p) => ({ ...p, quantity: 0 }));
    }
  }
}
