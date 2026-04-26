import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class DeliveriesService {
    // --- ДОДАНО: Логер для кращої діагностики ---
    private readonly logger = new Logger(DeliveriesService.name);

    constructor(
        @InjectRepository(Delivery)
        private readonly deliveryRepository: Repository<Delivery>,
        @InjectRepository(ChatMessage)
        private readonly chatRepository: Repository<ChatMessage>,
        private readonly kafkaService: KafkaService,
    ) {}

    async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
        const newDelivery = this.deliveryRepository.create(createDeliveryDto);
        const savedDelivery = await this.deliveryRepository.save(newDelivery);

        // --- ВИПРАВЛЕНО: Більш надійна відправка події в Kafka ---
        try {
            this.logger.log(`Attempting to send 'delivery_ordered' event for delivery ID: ${savedDelivery.id}`);
            await this.kafkaService.produce({
                topic: 'delivery_ordered',
                messages: [{
                    value: JSON.stringify({
                        type: 'delivery_ordered',
                        data: {
                            deliveryId: savedDelivery.id,
                            userId: savedDelivery.userId,
                            items: savedDelivery.items,
                        }
                    })
                }]
            });
            this.logger.log(`Successfully sent 'delivery_ordered' event.`);
        } catch (error) {
            // Важливо: Ми логуємо помилку, але НЕ "валимо" весь процес.
            // Замовлення створено, навіть якщо сповіщення не відправилось.
            this.logger.error('Failed to send Kafka event', error.stack);
        }

        return savedDelivery;
    }

    async findAllForUser(userId: string): Promise<Delivery[]> {
        return this.deliveryRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            relations: ['items'],
        });
    }

    async findOneForUser(id: string, userId: string): Promise<Delivery | null> {
        return this.deliveryRepository.findOne({
            where: { id, userId },
            relations: ['items'],
        });
    }

    async findAll(): Promise<Delivery[]> {
        return this.deliveryRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['items'],
        });
    }

    async updateStatus(id: string, status: string): Promise<Delivery> {
        await this.deliveryRepository.update(id, { status });
        const updated = await this.deliveryRepository.findOne({ where: { id }, relations: ['items'] });
        if (!updated) throw new Error(`Delivery ${id} not found`);
        return updated;
    }

    async assignCourier(id: string, deliveryPersonId: string): Promise<Delivery> {
        await this.deliveryRepository.update(id, { deliveryPersonId });
        const updated = await this.deliveryRepository.findOne({ where: { id }, relations: ['items'] });
        if (!updated) throw new Error(`Delivery ${id} not found`);
        return updated;
    }

    async findAllForCourier(courierId: string): Promise<Delivery[]> {
        return this.deliveryRepository.find({
            where: { deliveryPersonId: courierId },
            order: { createdAt: 'DESC' },
            relations: ['items'],
        });
    }

    async updateCourierOrderStatus(id: string, status: string, courierId: string): Promise<Delivery> {
        const delivery = await this.deliveryRepository.findOne({ where: { id, deliveryPersonId: courierId } });
        if (!delivery) throw new Error(`Delivery ${id} not found or not assigned to this courier`);
        await this.deliveryRepository.update(id, { status });
        return this.deliveryRepository.findOne({ where: { id }, relations: ['items'] }) as Promise<Delivery>;
    }

    async getChatHistory(orderId: string): Promise<ChatMessage[]> {
        return this.chatRepository.find({
            where: { orderId },
            order: { createdAt: 'ASC' },
        });
    }

    async saveMessage(orderId: string, fromUserId: string, fromRole: string, text: string): Promise<ChatMessage> {
        const msg = this.chatRepository.create({ orderId, fromUserId, fromRole, text });
        return this.chatRepository.save(msg);
    }
}