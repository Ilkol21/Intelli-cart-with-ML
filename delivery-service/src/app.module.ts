// delivery-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { Delivery } from './deliveries/entities/delivery.entity';
import { DeliveryItem } from './deliveries/entities/delivery-item.entity';
import { ChatMessage } from './deliveries/entities/chat-message.entity';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: parseInt(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        entities: [Delivery, DeliveryItem, ChatMessage],
        synchronize: true,
      }),
    }),
    DeliveriesModule,
    KafkaModule,
  ],
})
export class AppModule {}