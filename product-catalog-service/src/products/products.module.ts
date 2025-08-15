// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { HttpModule } from '@nestjs/axios'; // <-- Імпортуємо HttpModule

@Module({
  imports: [HttpModule], // <-- Додаємо HttpModule
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}