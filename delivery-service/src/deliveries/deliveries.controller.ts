// src/deliveries/deliveries.controller.ts
import {Controller, Post, Body, Get, Query, Param, Patch, NotFoundException} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Controller('deliveries')
export class DeliveriesController {
    constructor(private readonly deliveriesService: DeliveriesService) {}

    @Get('health')
    healthCheck() {
        return { status: 'ok' };
    }

    @Post()
    create(@Body() createDeliveryDto: CreateDeliveryDto) {
        return this.deliveriesService.create(createDeliveryDto);
    }


    @Get('my-orders')
    findAllForUser(@Query('userId') userId: string) {
        return this.deliveriesService.findAllForUser(userId);
    }

    @Get('my-orders/:id')
    findOneForUser(@Param('id') id: string, @Query('userId') userId: string) {
        const delivery = this.deliveriesService.findOneForUser(id, userId);
        if (!delivery) {
            throw new NotFoundException(`Delivery with ID "${id}" not found.`);
        }
        return delivery;
    }

    @Get('admin/all')
    findAll() {
        return this.deliveriesService.findAll();
    }

    @Patch('admin/:id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.deliveriesService.updateStatus(id, status);
    }

    @Patch('admin/:id/assign')
    assignCourier(@Param('id') id: string, @Body('deliveryPersonId') deliveryPersonId: string) {
        return this.deliveriesService.assignCourier(id, deliveryPersonId);
    }

    @Get('courier/orders')
    findAllForCourier(@Query('courierId') courierId: string) {
        return this.deliveriesService.findAllForCourier(courierId);
    }

    @Patch('courier/:id/status')
    updateCourierOrderStatus(
        @Param('id') id: string,
        @Body('status') status: string,
        @Body('courierId') courierId: string,
    ) {
        return this.deliveriesService.updateCourierOrderStatus(id, status, courierId);
    }

    @Get(':orderId/chat')
    getChatHistory(@Param('orderId') orderId: string) {
        return this.deliveriesService.getChatHistory(orderId);
    }

    @Post(':orderId/chat')
    saveMessage(
        @Param('orderId') orderId: string,
        @Body('fromUserId') fromUserId: string,
        @Body('fromRole') fromRole: string,
        @Body('text') text: string,
    ) {
        return this.deliveriesService.saveMessage(orderId, fromUserId, fromRole, text);
    }
}
