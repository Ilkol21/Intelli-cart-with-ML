// api-gateway/src/lists/lists.controller.ts
import {
    Controller,
    All,
    Req,
    UseGuards,
    Body,
    Post,
    Get,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
    private readonly logger = new Logger(ListsController.name);
    // --- ОСТАТОЧНЕ ВИПРАВЛЕННЯ ---
    // Додаємо правильний порт :3000
    private listServiceUrl = 'http://list-service:3000/lists';

    constructor(private readonly httpService: HttpService) {}

    @Post()
    async createList(@Req() req: Request, @Body() body: any) {
        const { user } = req as any;
        const newBody = { ...body, ownerId: user.userId };

        this.logger.log(`Proxying POST request to ${this.listServiceUrl} for user ${user.userId}`);

        try {
            const { data } = await firstValueFrom(
                this.httpService.post(this.listServiceUrl, newBody),
            );
            return data;
        } catch (error: any) {
            this.logger.error('Error proxying POST request:', error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get()
    async getLists(@Req() req: Request) {
        const { user } = req as any;
        const url = `${this.listServiceUrl}?ownerId=${user.userId}`;

        this.logger.log(`Proxying GET request to ${url} for user ${user.userId}`);

        try {
            const { data } = await firstValueFrom(this.httpService.get(url));
            return data;
        } catch (error: any) {
            this.logger.error('Error proxying GET request:', error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @All('*')
    async proxyOtherRequests(@Req() req: Request) {
        const { method, body, originalUrl, user } = req as any;
        const serviceUrl = `${this.listServiceUrl}${originalUrl.replace('/lists', '')}`;

        this.logger.log(`Proxying ${method} request to ${serviceUrl} for user ${user.userId}`);

        try {
            const { data } = await firstValueFrom(
                this.httpService.request({
                    method,
                    url: serviceUrl,
                    data: body,
                }),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying ${method} request:`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
