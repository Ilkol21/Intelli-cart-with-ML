import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private deliveryServiceUrl = 'http://delivery-service:3000/deliveries';

    constructor(private readonly httpService: HttpService) {}

    handleConnection(client: Socket) {
        this.logger.log(`Chat client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Chat client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join-order-room')
    handleJoinOrderRoom(@ConnectedSocket() client: Socket, @MessageBody() orderId: string) {
        client.join(`order-${orderId}`);
        this.logger.log(`Client ${client.id} joined room order-${orderId}`);
    }

    @SubscribeMessage('join-admin-room')
    handleJoinAdminRoom(@ConnectedSocket() client: Socket) {
        client.join('admin-room');
        this.logger.log(`Client ${client.id} joined admin-room`);
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { orderId: string; fromUserId: string; fromRole: string; text: string },
    ) {
        const { orderId, fromUserId, fromRole, text } = payload;

        try {
            const { data: savedMsg } = await firstValueFrom(
                this.httpService.post(`${this.deliveryServiceUrl}/${orderId}/chat`, {
                    fromUserId,
                    fromRole,
                    text,
                }),
            );

            this.server.to(`order-${orderId}`).emit('new-message', savedMsg);

            if (fromRole === 'delivery') {
                this.server.to('admin-room').emit('new-message', savedMsg);
            }
        } catch (error) {
            this.logger.error('Failed to save chat message', error);
            client.emit('error', { message: 'Failed to send message' });
        }
    }
}
