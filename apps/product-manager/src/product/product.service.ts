/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductDocument,
  Product as ProductSchema,
} from './schemas/product.schema';
import { FilterQuery, Model } from 'mongoose';
import { Product, CreateProductDto, ProductFiltersDto } from '@app/shared';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductSchema.name)
    private produitModel: Model<ProductDocument>,
    @Inject('INVENTORY_MANAGER_SERVICE')
    private inventoryClient: ClientProxy,
    @Inject('ORDER_MANAGER_SERVICE')
    private orderClient: ClientProxy,
    @Inject('FILE_MANAGER_SERVICE')
    private fileClient: ClientProxy,
  ) {}

  private readonly logger = new Logger(ProductService.name);

  async findAll(
    filters: ProductFiltersDto = {},
    populateCategorys: boolean = true,
  ): Promise<Product[]> {
    const query: FilterQuery<ProductDocument> = {};
    console.log('filter', filters);

    // Exclude soft-deleted products by default
    if (!filters.includeDeleted) {
      query.deletedAt = null;
    }

    // Map filters to Mongoose query
    const categoryIds = filters.category
      ? Array.isArray(filters.category)
        ? filters.category
        : [filters.category]
      : filters.categories || [];

    if (categoryIds.length > 0) {
      // Mongoose auto-casts strings to ObjectIds for fields defined as Types.ObjectId
      // We use the standard $in query which is compatible with array fields.
      query.category = { $in: categoryIds };
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
      const searchRegex = new RegExp(filters.searchTerm, 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    console.log('Query', query);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const results = await this.produitModel
      .find(query)
      .populate(populateCategorys ? { path: 'category', select: 'name' } : [])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    return results as unknown as Product[];
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
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .lean<Product>()
      .exec();

    if (deleted) {
      console.log('Emitting product_soft_deleted event for:', id);
      // Zero out inventory stock instead of deleting the record
      this.inventoryClient.emit('product_soft_deleted', id);
      // Do NOT delete the S3 image here — the cleanup cron handles it after 30 days
    }
    return deleted;
  }

  async restoreById(id: string): Promise<Product | null> {
    const restored = await this.produitModel
      .findByIdAndUpdate(id, { deletedAt: null }, { new: true })
      .lean<Product>()
      .exec();
    if (!restored) {
      throw new RpcException({
        message: 'Product not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return restored;
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      // Assuming URL format: https://domain.com/path/to/key
      // We want path/to/key
      const parsedUrl = new URL(url);
      // Remove leading slash from pathname to get the S3 key
      return parsedUrl.pathname.startsWith('/')
        ? parsedUrl.pathname.substring(1)
        : parsedUrl.pathname;
    } catch (e) {
      console.error('Failed to extract key from URL:', url, e);
      return null;
    }
  }

  async countProducts(): Promise<number> {
    console.log('Counting products');
    const count = await this.produitModel.countDocuments({ deletedAt: null }).exec();
    console.log('Count:', count);
    return count;
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
        if (!product || product.deletedAt) {
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

  /**
   * Cron job: Delete S3 images for products soft-deleted more than 30 days ago,
   * then permanently remove the MongoDB document.
   * Runs daily at 3:00 AM.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupDeletedProducts(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredProducts = await this.produitModel
      .find({ deletedAt: { $ne: null, $lte: thirtyDaysAgo } })
      .lean()
      .exec();

    this.logger.log(
      `[Cleanup] Found ${expiredProducts.length} product(s) to permanently delete`,
    );

    for (const product of expiredProducts) {
      // Delete S3 image
      if (product.image) {
        const key = this.extractKeyFromUrl(product.image);
        if (key) {
          this.logger.log(`[Cleanup] Deleting S3 image: ${key}`);
          this.fileClient.emit('delete_file', { key });
        }
      }

      // Delete inventory record permanently
      this.inventoryClient.emit('product_deleted', product._id.toString());

      // Permanently remove MongoDB document
      await this.produitModel.findByIdAndDelete(product._id).exec();
      this.logger.log(
        `[Cleanup] Permanently deleted product: ${product._id} (${product.name})`,
      );
    }
  }
}
