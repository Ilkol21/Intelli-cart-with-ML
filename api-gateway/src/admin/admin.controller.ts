// api-gateway/src/admin/admin.controller.ts
import { Controller, Get, Patch, Param, Body, UseGuards, HttpException, HttpStatus, Logger, Request } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { DeliveryGuard } from '../auth/delivery.guard';

@Controller('admin')
export class AdminController {
    private readonly logger = new Logger(AdminController.name);
    private deliveryServiceUrl = 'http://delivery-service:3000/deliveries';
    private userServiceUrl = 'http://user-service-web/api/admin';

    constructor(private readonly httpService: HttpService) {}

    @UseGuards(JwtAuthGuard, AdminGuard)
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

    @UseGuards(JwtAuthGuard, AdminGuard)
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

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch('orders/:id/assign')
    async assignCourier(@Param('id') id: string, @Body('deliveryPersonId') deliveryPersonId: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.patch(`${this.deliveryServiceUrl}/admin/${id}/assign`, { deliveryPersonId }),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error assigning courier to order ${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('users')
    async getUsers() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.userServiceUrl}/users`),
            );
            return data;
        } catch (error: any) {
            this.logger.error('Error fetching users', error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch('users/:id/status')
    async updateUserStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.patch(`${this.userServiceUrl}/users/${id}/status`, { is_active }),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error updating status for user ${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch('users/:id/role')
    async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.patch(`${this.userServiceUrl}/users/${id}/role`, { role }),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error updating role for user ${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @UseGuards(JwtAuthGuard, DeliveryGuard)
    @Get('courier/orders')
    async getCourierOrders(@Request() req: any) {
        const courierId = String(req.user?.userId);
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.deliveryServiceUrl}/courier/orders?courierId=${courierId}`),
            );
            return data;
        } catch (error: any) {
            this.logger.error('Error fetching courier orders', error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @UseGuards(JwtAuthGuard, DeliveryGuard)
    @Patch('courier/orders/:id/status')
    async updateCourierOrderStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
        const courierId = String(req.user?.userId);
        try {
            const { data } = await firstValueFrom(
                this.httpService.patch(`${this.deliveryServiceUrl}/courier/${id}/status`, { status, courierId }),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error updating courier order status ${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('chat/:orderId')
    async getChatHistory(@Param('orderId') orderId: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.deliveryServiceUrl}/${orderId}/chat`),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error fetching chat for order ${orderId}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}