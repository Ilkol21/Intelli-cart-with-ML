import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseInterceptors,
    UploadedFile,
    Query,
    NotFoundException,
    Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {UseFileInterceptor} from "../common/file-interceptor.decorator";


@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('health')
    healthCheck() {
        return { status: 'ok' };
    }

    @Get('by-name/:name')
    findByName(@Param('name') name: string) {
        return this.productsService.findByName(name);
    }

    @Get('by-category/:category')
    findByCategory(@Param('category') category: string, @Query('exclude') exclude?: string) {
        return this.productsService.findByCategory(category, exclude);
    }

    @Get('popular/:category')
    findPopularByCategory(@Param('category') category: string, @Query('exclude') exclude?: string) {
        return this.productsService.findPopularByCategory(category, exclude);
    }

    @Patch(':id/view')
    incrementView(@Param('id') id: string) {
        return this.productsService.incrementViewCount(id);
    }

    @Post()
    @UseFileInterceptor()
    create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (file) {
            createProductDto.imageUrl = `/uploads/${file.filename}`;
        }
        return this.productsService.create(createProductDto);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseFileInterceptor()
    update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (file) {
            updateProductDto.imageUrl = `/uploads/${file.filename}`;
        }
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}
