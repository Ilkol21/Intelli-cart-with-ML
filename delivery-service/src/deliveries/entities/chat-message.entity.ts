import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    orderId: string;

    @Column()
    fromUserId: string;

    @Column()
    fromRole: string;

    @Column('text')
    text: string;

    @CreateDateColumn()
    createdAt: Date;
}
