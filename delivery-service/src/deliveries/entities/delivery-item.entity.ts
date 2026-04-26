// src/deliveries/entities/delivery-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Delivery } from './delivery.entity';

@Entity('delivery_items')
export class DeliveryItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    productId: string;

    @Column()
    name: string;

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Delivery, delivery => delivery.items, { onDelete: 'CASCADE' })
    delivery: Delivery;
}
