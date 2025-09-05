// api-gateway/src/deliveries/deliveries.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DeliveriesController } from './deliveries.controller';

@Module({
  imports: [HttpModule],
  controllers: [DeliveriesController],
})
export class DeliveriesModule {}