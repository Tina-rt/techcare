import { Module } from '@nestjs/common';
import { ProductManagerController } from './product-manager.controller';
import { ProductManagerService } from './product-manager.service';
import { ProductModule } from './produit/product.module';
import { StockModule } from './stock/stock.module';
import { CategoriesModule } from './categories/categories.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://root:example@localhost:27017/gestion-produit?authSource=admin',
    ),
    ProductModule,
    StockModule,
    CategoriesModule,
  ],
  controllers: [ProductManagerController],
  providers: [ProductManagerService],
})
export class ProductManagerModule {}
