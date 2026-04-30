import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductService } from './product.service';
import { CreateProductDto, ProductFiltersDto, convertToCsv } from '@app/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAllProducts(@Query() filters: ProductFiltersDto) {
    console.log('[product controller] filters received', filters);
    return this.productService.findAll(filters);
  }

  @Get('export')
  async exportProducts(@Res() res: Response) {
    const products = await this.productService.findAll({});

    const csv = convertToCsv(products, [
      { field: 'name', header: 'Nom' },
      { field: 'serialNumber', header: 'Numéro de série' },
      { field: 'price', header: 'Prix' },
      { field: 'brand', header: 'Marque' },
      { field: 'quantity', header: 'Stock' },
      { field: 'active', header: 'Actif' },
    ]);

    res.header('Content-Type', 'text/csv');
    res.attachment(`products_${new Date().getTime()}.csv`);
    return res.send(csv);
  }

  @Get('search')
  searchProducts(@Query('q') q: string, @Query() filters: ProductFiltersDto) {
    return this.productService.search(q ?? filters.searchTerm ?? '', filters);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    console.log('[product controller] images received', image);
    return this.productService.create(createProductDto, image);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productService.update(id, updateProductDto, image);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/restore')
  restoreProduct(@Param('id') id: string) {
    return this.productService.restore(id);
  }
}
