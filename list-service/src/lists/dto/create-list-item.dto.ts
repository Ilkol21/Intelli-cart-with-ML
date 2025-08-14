// src/lists/dto/create-list-item.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateListItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    quantity?: number;
}