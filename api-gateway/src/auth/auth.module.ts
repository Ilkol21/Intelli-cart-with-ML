// api-gateway/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport'; // <--- Імпортуємо
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'; // <--- Імпортуємо

@Module({
    imports: [
        HttpModule,
        PassportModule, // <--- Реєструємо
    ],
    controllers: [AuthController],
    providers: [JwtStrategy], // <--- Додаємо стратегію як провайдер
})
export class AuthModule {}