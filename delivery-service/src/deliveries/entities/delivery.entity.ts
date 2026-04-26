// src/deliveries/entities/delivery.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { DeliveryItem } from './delivery-item.entity';

@Entity('deliveries')
export class Delivery {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ nullable: true, default: null })
    deliveryPersonId: string;

    @Column({ default: 'pending' })
    status: string;

    @Column('decimal')
    latitude: number;

    @Column('decimal')
    longitude: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => DeliveryItem, item => item.delivery, { cascade: true })
    items: DeliveryItem[];
}
