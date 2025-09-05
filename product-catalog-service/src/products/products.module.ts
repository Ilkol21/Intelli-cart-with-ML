// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../entities/product.entity';
import { HttpModule } from '@nestjs/axios'; // <-- Переконайтеся, що цей імпорт є

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    HttpModule, // <-- Цей модуль є ключовим
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}