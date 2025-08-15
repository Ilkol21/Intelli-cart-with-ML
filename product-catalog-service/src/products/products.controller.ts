// src/products/products.controller.ts
import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('price')
    async getPrice(@Query('name') name: string) {
        const productInfo = await this.productsService.findPriceByName(name);
        if (!productInfo) {
            throw new NotFoundException(`Price for product "${name}" not found.`);
        }
        return productInfo;
    }

    // Маршрут для healthcheck залишається
    @Get('/health')
    healthCheck() {
        return { status: 'ok' };
    }
}