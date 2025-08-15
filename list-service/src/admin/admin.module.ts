// list-service/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ShoppingList } from '../lists/entities/list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingList])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
