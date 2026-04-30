import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { NewBlogPost } from '@app/database/schema';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public: list published posts
  @Get()
  getAll(@Query('all') all?: string) {
    return this.blogService.getAll(all !== 'true');
  }

  // Public: get by slug
  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.blogService.getBySlug(slug);
  }

  // Public: get by id
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getById(id);
  }

  // Protected: create
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: NewBlogPost) {
    return this.blogService.create(data);
  }

  // Protected: update
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<NewBlogPost>,
  ) {
    return this.blogService.update(id, data);
  }

  // Protected: delete
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }
}
