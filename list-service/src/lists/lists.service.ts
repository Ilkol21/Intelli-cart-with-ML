// src/lists/lists.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ShoppingList } from './entities/list.entity';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { UpdateListItemDto } from './dto/update-list-item.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class ListsService {
  constructor(
      @InjectRepository(ShoppingList)
      private readonly listRepository: Repository<ShoppingList>,
      @InjectRepository(ListItem)
      private readonly itemRepository: Repository<ListItem>,
      private readonly kafkaService: KafkaService,
  ) {}
  
  async create(createListDto: CreateListDto): Promise<ShoppingList> {
    const newList = this.listRepository.create(createListDto);
    return this.listRepository.save(newList);
  }

  async findAllForUser(ownerId: string): Promise<ShoppingList[]> {
    return this.listRepository.find({ where: { ownerId } });
  }

  async findOne(id: string): Promise<ShoppingList> {
    const list = await this.listRepository.findOne({ where: { id } });
    if (!list) {
      throw new NotFoundException(`List with ID "${id}" not found`);
    }
    return list;
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<ShoppingList> {
    const list = await this.findOne(id);
    Object.assign(list, updateListDto);
    return this.listRepository.save(list);
  }

  async remove(id: string): Promise<void> {
    const result = await this.listRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`List with ID "${id}" not found`);
    }
  }


  async addItemToList(listId: string, createListItemDto: CreateListItemDto): Promise<ListItem> {
    const list = await this.findOne(listId);
    const newItem = this.itemRepository.create({
      ...createListItemDto,
      list: list,
    });
    const savedItem = await this.itemRepository.save(newItem);

    // Відправляємо подію в Kafka
    await this.kafkaService.produce({
      topic: 'shopping_events',
      messages: [
        {
          value: JSON.stringify({
            type: 'item_added',
            data: {
              userId: list.ownerId,
              listId: list.id,
              itemName: savedItem.name,
              quantity: savedItem.quantity,
            },
          }),
        },
      ],
    });

    return savedItem;
  }

  async updateListItem(itemId: string, updateListItemDto: UpdateListItemDto): Promise<ListItem> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Item with ID "${itemId}" not found`);
    }
    Object.assign(item, updateListItemDto);
    return this.itemRepository.save(item);
  }

  async removeListItem(itemId: string): Promise<void> {
    const result = await this.itemRepository.delete(itemId);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID "${itemId}" not found`);
    }
  }
}