// delivery-service/src/deliveries/deliveries.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { Delivery } from './entities/delivery.entity';
import { DeliveryItem } from './entities/delivery-item.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { KafkaModule } from '../kafka/kafka.module'; // <-- Імпортуємо

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, DeliveryItem, ChatMessage]),
    KafkaModule, // <-- Додаємо
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
})
export class DeliveriesModule {}