import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async findAll(): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.productClient.send('find_all_categories', {}),
    );
  }

  async findById(id: string): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.productClient.send('find_category_by_id', id),
    );
  }

  async create(data: CreateCategoryDto): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.productClient.send('create_category', data),
    );
  }

  async update(id: string, data: CreateCategoryDto): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.productClient.send('update_category', { id, data }),
    );
  }

  async delete(id: string): Promise<unknown> {
    return lastValueFrom<unknown>(
      this.productClient.send('delete_category', id),
    );
  }
}
