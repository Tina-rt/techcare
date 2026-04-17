import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendAndCatch } from '@app/shared';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async findAll(): Promise<unknown> {
    return sendAndCatch<unknown>(this.productClient, 'find_all_categories', {});
  }

  async findById(id: string): Promise<unknown> {
    return sendAndCatch<unknown>(this.productClient, 'find_category_by_id', id);
  }

  async create(data: CreateCategoryDto): Promise<unknown> {
    return sendAndCatch<unknown>(this.productClient, 'create_category', data);
  }

  async update(id: string, data: CreateCategoryDto): Promise<unknown> {
    return sendAndCatch<unknown>(this.productClient, 'update_category', { id, data });
  }

  async delete(id: string): Promise<unknown> {
    return sendAndCatch<unknown>(this.productClient, 'delete_category', id);
  }
}
