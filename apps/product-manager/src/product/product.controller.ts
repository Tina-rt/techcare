import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAllProducts() {
    return this.productService.findAll({}, true);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createProduct(
    @Body() creerProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    console.log('image', image);
    // return { data: 'ok' };
    return this.productService.createProduct(creerProductDto, image);
  }

  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return this.productService.updateById(id, updateProductDto);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteById(id);
  }
}
