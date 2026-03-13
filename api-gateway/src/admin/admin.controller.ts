// api-gateway/src/admin/admin.controller.ts
import { Controller, Get, Patch, Param, Body, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    private readonly logger = new Logger(AdminController.name);
    private deliveryServiceUrl = 'http://delivery-service:3000/deliveries';

    constructor(private readonly httpService: HttpService) {}

    @Get('orders')
    async getAllOrders() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.deliveryServiceUrl}/admin/all`),
            );
            return data;
        } catch (error: any) {
            this.logger.error('Error fetching all orders', error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('orders/:id/status')
    async updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.patch(`${this.deliveryServiceUrl}/admin/${id}/status`, { status }),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error updating status for order ${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}