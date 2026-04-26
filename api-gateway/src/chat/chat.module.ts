import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [HttpModule],
    providers: [ChatGateway],
})
export class ChatModule {}
