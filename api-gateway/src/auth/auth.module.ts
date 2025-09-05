// api-gateway/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; // <-- КРОК 1: ІМПОРТУЙТЕ JwtModule
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        HttpModule,
        PassportModule,
        // V V V КРОК 2: ДОДАЙТЕ ТА НАЛАШТУЙТЕ JwtModule V V V
        JwtModule.register({
            // УВАГА: Вставте сюди ТОЙ САМИЙ секретний ключ,
            // який ваш Laravel-бекенд використовує для підпису токенів.
            // Зазвичай він знаходиться у файлі .env як JWT_SECRET
            secret: 'vHmALHuZ8rbU7mELZccUwg00wDjMbZu10TpAhpDegJY4oUGpsSI6VZFWcJD5t5k7',
        }),
    ],
    controllers: [AuthController],
    providers: [JwtStrategy],
    exports: [PassportModule],
})
export class AuthModule {}