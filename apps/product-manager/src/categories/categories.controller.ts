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
import { CategoriesService } from './categories.service';
import { CreerCategorieDto } from './dtos/creer-categorie.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAllCategories() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  getCategorieById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  createCategorie(@Body() creerCategorie: CreerCategorieDto) {
    return this.categoriesService.create(creerCategorie);
  }

  @Put(':id')
  updateCategorie(
    @Param('id') id: string,
    @Body() updateCategorieDto: CreerCategorieDto,
  ) {
    return this.categoriesService.updateById(id, updateCategorieDto);
  }

  @Delete(':id')
  deleteCategorie(@Param('id') id: string) {
    return this.categoriesService.deleteById(id);
  }
}
