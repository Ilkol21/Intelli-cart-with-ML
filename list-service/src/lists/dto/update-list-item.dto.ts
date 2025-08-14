// src/lists/dto/update-list-item.dto.ts
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateListItemDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsBoolean()
    @IsOptional()
    completed?: boolean;
}