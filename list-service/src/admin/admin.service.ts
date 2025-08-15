// list-service/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingList } from '../lists/entities/list.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(ShoppingList)
        private readonly listRepository: Repository<ShoppingList>,
    ) {}

    async getStats() {
        const totalLists = await this.listRepository.count();
        return { totalLists };
    }
}