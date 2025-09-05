// api-gateway/src/deliveries/deliveries.controller.ts
import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('deliveries')
export class DeliveriesController {
    private deliveryServiceUrl = 'http://delivery-service:3000/deliveries';

    constructor(private readonly httpService: HttpService) {}

    @Post()
    async createDelivery(@Req() req: Request, @Body() body: any) {
        const { user } = req as any;
        const createDeliveryDto = {
            ...body,
            userId: user.userId, // Додаємо userId з токена
        };
        const { data } = await firstValueFrom(
            this.httpService.post(this.deliveryServiceUrl, createDeliveryDto),
        );
        return data;
    }

    @Get()
    async findForUser(@Req() req: Request) {
        const { user } = req as any;
        const { data } = await firstValueFrom(
            this.httpService.get(this.deliveryServiceUrl, { params: { userId: user.userId } }),
        );
        return data;
    }
}