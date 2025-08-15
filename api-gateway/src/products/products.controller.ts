// api-gateway/src/products/products.controller.ts
import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard) // Захищаємо всі маршрути в цьому контролері
@Controller('products')
export class ProductsController {
    private catalogServiceUrl = 'http://product-catalog-service:3000/products';

    constructor(private readonly httpService: HttpService) {}

    @Get('price')
    async getPrice(@Query('name') name: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.catalogServiceUrl}/price`, { params: { name } }),
        );
        return data;
    }
}