import { Module } from '@nestjs/common';
import { ProductManagerController } from './product-manager.controller';
import { ProductManagerService } from './product-manager.service';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';
import { CategorysModule } from './category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FILE_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5672'],
          queue: 'file_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
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
