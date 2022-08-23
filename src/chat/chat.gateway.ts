import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

class StartChat {
  chat: {
    id: number;
    me_id: number;
    opp_id: number;
  };
}

@WebSocketGateway(3201, {
  transports: ['websocket'],
  namespace: 'chat',
  cors: true,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  sockets = [];

  private logger: Logger = new Logger('ChatGateWay');

  @SubscribeMessage('startChat')
  handleStartChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() startChat: StartChat,
  ) {
    const {
      chat: { id, opp_id, me_id },
    } = startChat;
    const chatId = String(id);
    socket.join(chatId);
    socket.to(chatId).emit('startChat', { room: chatId });
    return;
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    console.log(data);
    this.server.emit(data);
    return data;
  }

  @SubscribeMessage('clientToServer')
  async handleMessage(@MessageBody() data: string) {
    console.log(data);
    return data;
  }

  @SubscribeMessage('whoAreThere')
  handleWho(@MessageBody() data: string) {
  }

  @SubscribeMessage('create')
  handleCreate(@MessageBody() data: string) {
    console.log(data);
    return;
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Client Connected : ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client Disconnected : ${socket.id}`);    
  }
}
