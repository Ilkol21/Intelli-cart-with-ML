// api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ListsModule } from './lists/lists.module';
import { NotificationsModule } from './notifications/notifications.module'; // <-- Імпортуємо

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ListsModule,
    NotificationsModule, // <-- Додаємо сюди
  ],
})
export class AppModule {}