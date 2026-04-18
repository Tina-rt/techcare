import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CategorysService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('category')
export class CategorysController {
  constructor(private readonly categoryService: CategorysService) {}

  @Get()
  @MessagePattern('find_all_categories')
  getAllCategorys() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @MessagePattern('find_category_by_id')
  getCategoryById(@Param('id') @Payload() id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  @MessagePattern('create_category')
  createCategory(@Body() @Payload() creerCategory: CreateCategoryDto) {
    return this.categoryService.create(creerCategory);
  }

  @Put(':id')
  @MessagePattern('update_category')
  updateCategory(
    @Param('id') id: string,
    @Body() @Payload() payload: { id: string; data: CreateCategoryDto },
  ) {
    const categoryId = id || payload.id;
    const data: CreateCategoryDto = payload.data ?? (payload as unknown as CreateCategoryDto);
    return this.categoryService.updateById(categoryId, data);
  }

  @Delete(':id')
  @MessagePattern('delete_category')
  deleteCategory(@Param('id') @Payload() id: string) {
    return this.categoryService.deleteById(id);
  }
}
