// src/lists/entities/list-item.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { ShoppingList } from './list.entity';

@Entity('list_items') // Назва таблиці для товарів
export class ListItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ default: 1 })
    quantity: number;

    @Column({ default: false })
    completed: boolean;

    // Встановлюємо зв'язок: багато товарів належать одному списку.
    // onDelete: 'CASCADE' означає, що при видаленні списку всі його товари також видаляться.
    @ManyToOne(() => ShoppingList, (list) => list.items, { onDelete: 'CASCADE' })
    list: ShoppingList;
}
