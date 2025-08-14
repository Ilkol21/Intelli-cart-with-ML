// src/lists/lists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { ShoppingList } from './entities/list.entity';
import { ListItem } from './entities/list-item.entity';
import { KafkaModule } from '../kafka/kafka.module'; // <-- ВИПРАВЛЕННЯ: Імпортуємо KafkaModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingList, ListItem]),
    KafkaModule, // <-- ВИПРАВЛЕННЯ: Додаємо KafkaModule сюди
  ],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}