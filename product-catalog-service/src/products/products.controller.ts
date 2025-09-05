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

    @Get('category')
    findByCategory(@Query('q') category: string) {
        return this.productsService.findByCategory(category);
    }


    @Put(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }

    @Get('/health')
    healthCheck() {
        return { status: 'ok' };
    }
}
