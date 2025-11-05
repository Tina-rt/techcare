import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CategorysService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';

@Controller('category')
export class CategorysController {
  constructor(private readonly categoryService: CategorysService) {}

  @Get()
  getAllCategorys() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  getCategoryById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  createCategory(@Body() creerCategory: CreateCategoryDto) {
    return this.categoryService.create(creerCategory);
  }

  @Put(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.updateById(id, updateCategoryDto);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteById(id);
  }
}
