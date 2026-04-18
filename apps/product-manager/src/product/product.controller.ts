import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, ProductFiltersDto } from '@app/shared';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @MessagePattern('find_all_products')
  getAllProducts(@Payload() filters: ProductFiltersDto) {
    return this.productService.findAll(filters, true);
  }

  @MessagePattern('search_products')
  searchProducts(
    @Payload()
    payload: ProductFiltersDto & { keyword: string },
  ) {
    const { keyword, ...filters } = payload;
    return this.productService.searchProducts(keyword, filters);
  }

  @Get(':id')
  @MessagePattern('find_product_by_id')
  getProductById(@Payload() id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @MessagePattern('create_product')
  createProduct(@Payload() creerProductDto: CreateProductDto) {
    // L'image est déjà uploadée par la Gateway (File Manager).
    // Le payload contient l'URL finale dans creerProductDto.image
    console.log('[Product manager service] Creating product:', creerProductDto);
    return this.productService.createProduct(creerProductDto);
  }

  @Put(':id')
  @MessagePattern('update_product')
  updateProduct(@Payload() payload: { id: string; data: CreateProductDto }) {
    // In microservices without a dedicated payload class,
    // nested objects like 'data' might not be transformed automatically.
    // We rely on the global transform pipe, but sometimes we need to be explicit.
    return this.productService.updateById(payload.id, payload.data);
  }

  @Delete(':id')
  @MessagePattern('delete_product')
  deleteProduct(@Payload() id: string) {
    return this.productService.deleteById(id);
  }

  @EventPattern('order_created')
  handleOrderCreated(
    @Payload()
    data: {
      orderId: string;
      items: { productId: string; quantity: number }[];
      userId: string;
    },
  ) {
    return this.productService.validateOrderProducts(data);
  }

  @MessagePattern('count_products')
  countProducts() {
    return this.productService.countProducts();
  }
}
