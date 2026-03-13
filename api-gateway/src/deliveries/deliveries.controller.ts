import { Controller, Get, Post, Req, UseGuards, HttpException, HttpStatus, Logger, Param, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Захищаємо всі маршрути в цьому контролері
@Controller('deliveries')
export class DeliveriesController {
    private readonly logger = new Logger(DeliveriesController.name);
    private deliveryServiceUrl = 'http://delivery-service:3000/deliveries';

    constructor(private readonly httpService: HttpService) {}

    @Post()
    async createDelivery(@Req() req: Request, @Body() body: any) {
        const { user } = req as any;
        const url = this.deliveryServiceUrl;
        const newBody = { ...body, userId: user.userId };

        this.logger.log(`Proxying CREATE delivery request for user ${user.userId}`);
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(url, newBody)
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying CREATE delivery request`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('my-orders')
    async getMyOrders(@Req() req: Request) {
        const { user } = req as any;
        const url = `${this.deliveryServiceUrl}/my-orders`;
        this.logger.log(`Proxying request for user ${user.userId} to ${url}`);

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(url, { params: { userId: user.userId } })
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying GET my-orders request`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('my-orders/:id')
    async getMyOrderDetails(@Req() req: Request, @Param('id') id: string) {
        const { user } = req as any;
        const url = `${this.deliveryServiceUrl}/my-orders/${id}`;
        this.logger.log(`Proxying request for user ${user.userId} to ${url}`);

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(url, { params: { userId: user.userId } })
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying GET my-orders/:id request`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

