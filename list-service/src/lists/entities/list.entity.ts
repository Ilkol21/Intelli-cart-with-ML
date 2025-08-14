// src/lists/entities/list.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany, // Імпортуємо OneToMany
} from 'typeorm';
import { ListItem } from './list-item.entity'; // Імпортуємо ListItem

@Entity('shopping_lists')
export class ShoppingList {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    ownerId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // --- ОНОВЛЕННЯ ТУТ ---
    // Встановлюємо зв'язок: один список може мати багато товарів.
    // eager: true означає, що при завантаженні списку його товари завантажаться автоматично.
    @OneToMany(() => ListItem, (item) => item.list, { cascade: true, eager: true })
    items: ListItem[];
}
