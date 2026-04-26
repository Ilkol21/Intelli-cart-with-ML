// src/main.ts
import { webcrypto } from 'crypto';

// --- ОСТАТОЧНЕ ВИПРАВЛЕННЯ ---
// Цей код гарантує, що модуль crypto буде доступний глобально,
// що є вимогою для @nestjs/typeorm у вашому середовищі.
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();