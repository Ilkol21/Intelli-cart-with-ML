// src/main.ts
import { webcrypto } from 'crypto';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// --- ОСТАТОЧНЕ ВИПРАВЛЕННЯ ---
// Цей код гарантує, що модуль crypto буде доступний глобально,
// що є вимогою для @nestjs/typeorm у вашому середовищі.
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(3000);
}
bootstrap();