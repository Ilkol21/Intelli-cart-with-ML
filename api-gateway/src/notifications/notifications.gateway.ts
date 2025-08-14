// src/notifications/notifications.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as amqp from 'amqp-connection-manager';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { Logger } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';

const RECOMMENDATION_QUEUE = 'recommendations';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private clients: Map<string, Socket> = new Map();
    private connection: AmqpConnectionManager;
    private channelWrapper: ChannelWrapper;

    constructor() {
        this.connectToRabbitMQ();
    }

    private connectToRabbitMQ() {
        this.connection = amqp.connect(['amqp://guest:guest@rabbitmq:5672']);
        this.channelWrapper = this.connection.createChannel({
            setup: async (channel: Channel) => {
                await channel.assertQueue(RECOMMENDATION_QUEUE, { durable: true });
                await channel.consume(RECOMMENDATION_QUEUE, (message) => this.handleRecommendation(message));
            },
        });

        this.channelWrapper.waitForConnect().then(() => {
            this.logger.log('Connected to RabbitMQ and listening for recommendations');
        });
    }

    private handleRecommendation(message: ConsumeMessage | null) {
        if (message) {
            try {
                const content = JSON.parse(message.content.toString());
                const { userId, recommendedItem } = content;
                this.logger.log(`Received recommendation for user ${userId}: ${recommendedItem}`);

                const clientSocket = this.clients.get(String(userId));
                if (clientSocket) {
                    clientSocket.emit('new_recommendation', { item: recommendedItem });
                    this.logger.log(`Sent recommendation to user ${userId}`);
                } else {
                    this.logger.warn(`User ${userId} is not connected. Cannot send recommendation.`);
                }

                this.channelWrapper.ack(message);
            } catch (error) {
                this.logger.error('Failed to process RabbitMQ message', error);
                this.channelWrapper.nack(message, false, true);
            }
        }
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.clients.forEach((socket, userId) => {
            if (socket.id === client.id) {
                this.clients.delete(userId);
                this.logger.log(`Client disconnected and removed: ${client.id} (User ID: ${userId})`);
            }
        });
    }

    @SubscribeMessage('register')
    handleRegister(client: Socket, userId: string): void {
        this.logger.log(`Registering client ${client.id} for user ID: ${userId}`);
        this.clients.set(String(userId), client);
    }
}
