// src/deliveries/dto/create-delivery.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DeliveryItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    price: number;
}

export class CreateDeliveryDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveryItemDto)
    items: DeliveryItemDto[];
}