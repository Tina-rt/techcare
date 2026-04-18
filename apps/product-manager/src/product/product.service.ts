/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductDocument,
  Product as ProductSchema,
} from './schemas/product.schema';
import { FilterQuery, Model } from 'mongoose';
import { Product, CreateProductDto, ProductFiltersDto } from '@app/shared';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductSchema.name)
    private produitModel: Model<ProductDocument>,
    @Inject('INVENTORY_MANAGER_SERVICE')
    private inventoryClient: ClientProxy,
    @Inject('ORDER_MANAGER_SERVICE')
    private orderClient: ClientProxy,
  ) {}

  async findAll(
    filters: ProductFiltersDto = {},
    populateCategorys: boolean = true,
  ): Promise<Product[]> {
    const query: FilterQuery<ProductDocument> = {};

    // Map filters to Mongoose query
    if (filters.category) {
      query.category = { $in: filters.category };
    } else if (filters.categories) {
      query.category = { $in: filters.categories };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.isActive !== undefined) {
      query.active = filters.isActive;
    }

    if (filters.searchTerm) {
      query.$text = { $search: filters.searchTerm };
    }

    const results = await this.produitModel
      .find(query)
      .populate(populateCategorys ? { path: 'category', select: 'name' } : [])
      .lean()
      .exec();
    return results as unknown as Product[];
  }

  async searchProducts(
    keyword: string,
    filters: ProductFiltersDto = {},
  ): Promise<Product[]> {
    const query: FilterQuery<ProductDocument> = {};

    if (keyword && keyword.trim()) {
      // Utilise l'index texte MongoDB pour la recherche full-text
      query.$text = { $search: keyword.trim() };
    } else if (filters.searchTerm) {
      query.$text = { $search: filters.searchTerm.trim() };
    } else {
      // Sans mot-clé, recherche par regex sur le nom (fallback)
      query.name = { $regex: keyword ?? '', $options: 'i' };
    }

    if (filters.category) {
      query.category = { $in: filters.category };
    } else if (filters.categories) {
      query.category = { $in: filters.categories };
    }
    const priceFilter: { $gte?: number; $lte?: number } = {};
    if (filters.minPrice !== undefined) {
      priceFilter.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      priceFilter.$lte = filters.maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      query.price = priceFilter;
    }
    if (filters.isActive !== undefined) {
      query.active = filters.isActive;
    }

    let baseQuery = this.produitModel
      .find(query)
      .populate({ path: 'category', select: 'name description' });

    // Si recherche textuelle, trier par score de pertinence
    if (keyword && keyword.trim()) {
      baseQuery = baseQuery.sort({ score: { $meta: 'textScore' } });
    }

    const results = await baseQuery.lean<Product[]>().exec();
    return results;
  }

  async findById(id: string): Promise<Product> {
    const result = await this.produitModel
      .findById(id)
      .populate({ path: 'category', select: 'name description' })
      .lean<Product>()
      .exec();
    if (!result) {
      throw new RpcException({
        message: 'Product not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return result;
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const prfound = await this.produitModel
      .findOne({ serialNumber: productData.serialNumber })
      .exec();
    if (prfound) {
      throw new RpcException({
        message: 'Product with this serial number already exists',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    // L'URL de l'image est déjà fournie dans le payload par la Gateway
    const createdProduct = new this.produitModel({
      ...productData,
      image: productData.image ?? '',
    });
    const newProduct = await createdProduct.save();
    console.log('[Create product]', newProduct);

    // Initialiser le stock via l'Inventory Service
    if (productData.quantity === undefined || productData.quantity === null) {
      productData.quantity = 0;
    }
    console.log('sending product_created event', {
      productId: newProduct._id.toString(),
      quantity: productData.quantity,
    });
    this.inventoryClient.emit('product_created', {
      productId: newProduct._id.toString(),
      quantity: productData.quantity,
    });

    return newProduct.toObject({ virtuals: true }) as unknown as Product;
  }

  async updateById(
    id: string,
    updateProductDto: CreateProductDto,
  ): Promise<Product | null> {
    const updated = await this.produitModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .lean<Product>()
      .exec();
    return updated;
  }

  async deleteById(id: string): Promise<Product | null> {
    const deleted = await this.produitModel
      .findByIdAndDelete(id)
      .lean<Product>()
      .exec();
    return deleted;
  }

  async validateOrderProducts(data: {
    orderId: string;
    items: { productId: string; quantity: number }[];
    userId: string;
  }): Promise<void> {
    const { orderId, items, userId } = data;
    try {
      for (const item of items) {
        const product = await this.produitModel.findById(item.productId).exec();
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
      }

      // Success: Emit to InventoryService
      this.inventoryClient.emit('product_validated', {
        orderId,
        items,
        userId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      // Failure: Emit to OrderService to cancel
      this.orderClient.emit('product_validation_failed', {
        orderId,
        reason: message,
      });
    }
  }
}
