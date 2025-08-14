// api-gateway/src/lists/lists.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ListsController } from './lists.controller';

@Module({
  imports: [HttpModule], // <-- Додайте це
  controllers: [ListsController],
})
export class ListsModule {}