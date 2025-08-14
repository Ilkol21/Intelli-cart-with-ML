// src/lists/lists.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { UpdateListItemDto } from './dto/update-list-item.dto';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  // --- Маршрути для списків ---
  @Post()
  create(@Body() createListDto: CreateListDto) {
    return this.listsService.create(createListDto);
  }

  @Get()
  findAllForUser(@Query('ownerId') ownerId: string) {
    return this.listsService.findAllForUser(ownerId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.listsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateListDto: UpdateListDto) {
    return this.listsService.update(id, updateListDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.listsService.remove(id);
  }

  // --- НОВІ МАРШРУТИ ДЛЯ ТОВАРІВ ---
  @Post(':listId/items')
  addItem(
      @Param('listId', ParseUUIDPipe) listId: string,
      @Body() createListItemDto: CreateListItemDto,
  ) {
    return this.listsService.addItemToList(listId, createListItemDto);
  }

  @Patch('/items/:itemId')
  updateItem(
      @Param('itemId', ParseUUIDPipe) itemId: string,
      @Body() updateListItemDto: UpdateListItemDto,
  ) {
    return this.listsService.updateListItem(itemId, updateListItemDto);
  }

  @Delete('/items/:itemId')
  removeItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.listsService.removeListItem(itemId);
  }
}