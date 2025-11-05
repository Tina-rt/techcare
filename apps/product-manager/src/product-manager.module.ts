import { Module } from '@nestjs/common';
import { ProductManagerController } from './product-manager.controller';
import { ProductManagerService } from './product-manager.service';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';
import { CategorysModule } from './category/category.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://root:example@localhost:27017/product-manager?authSource=admin',
    ),
    ProductModule,
    StockModule,
    CategorysModule,
  ],
  controllers: [ProductManagerController],
  providers: [ProductManagerService],
})
export class ProductManagerModule {}
