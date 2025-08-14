// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListsModule } from './lists/lists.module';
import { ShoppingList } from './lists/entities/list.entity';
import { ListItem } from './lists/entities/list-item.entity';
import { KafkaModule } from './kafka/kafka.module'; // <-- Імпортуємо KafkaModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [ShoppingList, ListItem],
        synchronize: true,
        logging: true,
      }),
    }),
    ListsModule,
    KafkaModule,
  ],
})
export class AppModule {}