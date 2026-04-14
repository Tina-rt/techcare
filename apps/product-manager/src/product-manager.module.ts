import { Module } from '@nestjs/common';
import { ProductManagerController } from './product-manager.controller';
import { ProductManagerService } from './product-manager.service';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';
import { CategorysModule } from './category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: 'FILE_MANAGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              process.env.RABBITMQ_URL ||
              'amqp://admin:admin@localhost:5672',
          ],
          queue: 'file_manager_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    ProductModule,
    StockModule,
    CategorysModule,
  ],
  controllers: [ProductManagerController],
  providers: [ProductManagerService],
})
export class ProductManagerModule {}
