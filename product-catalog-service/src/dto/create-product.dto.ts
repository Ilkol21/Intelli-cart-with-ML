// src/products/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsNumber()
    price: number;

}
