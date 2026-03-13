import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Not, Raw, Repository} from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    // Створення продукту
    async create(createProductDto: CreateProductDto): Promise<Product> {
        // ⚡ створюємо plain object
        const product = this.productRepository.create({
            name: createProductDto.name,
            description: createProductDto.description,
            price: createProductDto.price,
            category: createProductDto.category,
            imageUrl: createProductDto.imageUrl,
        });
        return this.productRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return this.productRepository.find();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }
        return product;
    }


    // Оновлення продукту
    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.productRepository.preload({
            id,
            name: updateProductDto.name,
            description: updateProductDto.description,
            price: updateProductDto.price,
            category: updateProductDto.category,
            imageUrl: updateProductDto.imageUrl,
        });

        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }
        return this.productRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const result = await this.productRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }
    }
    async findByName(name: string): Promise<Product | null> {
        return this.productRepository.findOne({ where: { name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name }) } });
    }

    async findByCategory(category: string, currentProductId?: string): Promise<Product[]> {
        const whereClause: any = { category };
        if (currentProductId) {
            whereClause.id = Not(currentProductId);
        }
        return this.productRepository.find({ where: whereClause, take: 5 });
    }

    async incrementViewCount(id: string): Promise<Product> {
        await this.productRepository.increment({ id }, 'viewCount', 1);
        return this.findOne(id);
    }

    async findPopularByCategory(category: string, excludeId?: string): Promise<Product[]> {
        const whereClause: any = { category };
        if (excludeId) {
            whereClause.id = Not(excludeId);
        }
        return this.productRepository.find({
            where: whereClause,
            order: { viewCount: 'DESC' },
            take: 5,
        });
    }

}
