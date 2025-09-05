import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Req,
    UseGuards,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import FormData from 'form-data';
import {AxiosRequestConfig} from "axios";

@Controller('products')
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);
    private catalogServiceUrl = 'http://product-catalog-service:3000/products';

    constructor(private readonly httpService: HttpService) {}

    // --- ПУБЛІЧНІ МАРШРУТИ ---
    @Get()
    async getProducts() {
        this.logger.log(`Proxying PUBLIC request to GET ${this.catalogServiceUrl}`);
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(this.catalogServiceUrl),
            );
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying GET /products`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('by-category/:category')
    async getByCategory(@Param('category') category: string, @Query('exclude') exclude: string) {
        this.logger.log(`Proxying PUBLIC request to GET ${this.catalogServiceUrl}/by-category/${category}`);
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.catalogServiceUrl}/by-category/${category}`, { params: { exclude } }),
            );
            return data;
        } catch (error: any) {
            // ... (обробка помилок)
        }
    }

    @Get(':id')
    async getProductById(@Param('id') id: string) {
        const url = `${this.catalogServiceUrl}/${id}`;
        this.logger.log(`Proxying PUBLIC request to GET ${url}`);
        try {
            const { data } = await firstValueFrom(this.httpService.get(url));
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying GET /products/${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // --- АДМІН-МАРШРУТИ ---
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(FileInterceptor('image') as any) // 👈 виправлення
    async createProduct(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
        this.logger.log(`Proxying ADMIN request to POST ${this.catalogServiceUrl}`);

        const formData = new FormData();
        // Додаємо всі текстові поля
        Object.keys(body).forEach(key => formData.append(key, body[key]));

        // Додаємо файл, якщо він є
        if (file) {
            formData.append('image', file.buffer, file.originalname);
        }

        try {
            const { data } = await firstValueFrom(
                this.httpService.post<any>(this.catalogServiceUrl, formData, {
                    headers: formData.getHeaders() as any,
                } as AxiosRequestConfig),
            );
            return data;
        } catch (error: any) {
            this.logger.error('Error proxying POST /products', error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    @Put(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateProduct(@Param('id') id: string, @Body() body: any) {
        const url = `${this.catalogServiceUrl}/${id}`;
        this.logger.log(`Proxying ADMIN request to PUT ${url}`);
        try {
            const { data } = await firstValueFrom(this.httpService.put(url, body));
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying PUT /products/${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteProduct(@Param('id') id: string) {
        const url = `${this.catalogServiceUrl}/${id}`;
        this.logger.log(`Proxying ADMIN request to DELETE ${url}`);
        try {
            const { data } = await firstValueFrom(this.httpService.delete(url));
            return data;
        } catch (error: any) {
            this.logger.error(`Error proxying DELETE /products/${id}`, error.stack);
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
