// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Module({
    providers: [NotificationsGateway],
})
export class NotificationsModule {}