import {
  ConnectedSocket,
  GatewayMetadata,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthenticatedSocket } from './interfaces/authenticatedSocket';
import { SocketSessionService } from './services/socketSession.service';
import { GroupService } from '@modules/group/services/group.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ServerEvents } from '@common/constants/constant';
import { CreateMessageResponse } from '@shared/types';
import { Conversation } from '@common/database/entities';

const webSocketConfig: GatewayMetadata = {
  cors: {
    origin: [process.env.ALLOW_ORIGIN],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
};

@WebSocketGateway(webSocketConfig)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  constructor(
    private readonly sessions: SocketSessionService,
    private readonly groupService: GroupService
  ) {}

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log(`${socket.user.username} connected`);
    this.sessions.setUserSocket(socket.user.id, socket);
    socket.emit('connected', {});
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`${socket.user.username} disconnected`);
    this.sessions.removeUserSocket(socket.user.id);
  }

  @SubscribeMessage('getOnlineGroupUsers')
  async handleGetOnlineGroupUsers(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const group = await this.groupService.findGroupById(parseInt(data.groupId));
    if (!group) {
      return;
    }

    const onlineUsers = [];
    const offlineUsers = [];
    group.users.forEach((user) => {
      const socket = this.sessions.getUserSocket(user.id);
      socket ? onlineUsers.push(user) : offlineUsers.push(user);
    });
    socket.emit('onlineGroupUsersReceived', { onlineUsers, offlineUsers });
  }

  @SubscribeMessage('onConversationJoin')
  onConversationJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(
      `userId ${client.user.id} joined a conversationId: ${data.conversationId}`
    );

    client.join(`conversation-${data.conversationId}`);
    console.log(`userId ${client.user.id} rooms:`, client.rooms);

    client
      .to(`conversation-${data.conversationId}`)
      .emit('userConversationJoin');
  }

  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(
      `userId ${client.user.id} left a conversationId: ${data.conversationId}`
    );

    client.leave(`conversation-${data.conversationId}`);
    console.log(`userId ${client.user.id} rooms:`, client.rooms);

    client
      .to(`conversation-${data.conversationId}`)
      .emit('userConversationLeave');
  }

  @SubscribeMessage('onGroupJoin')
  onGroupJoin(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(`userId ${client.user.id} join a groupId: ${data.groupId}`);

    client.join(`group-${data.groupId}`);
    console.log(`userId ${client.user.id} rooms:`, client.rooms);

    client.to(`group-${data.groupId}`).emit('userGroupJoin');
  }

  @SubscribeMessage('onGroupLeave')
  onGroupLeave(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(`userId ${client.user.id} left a groupId: ${data.groupId}`);

    client.leave(`group-${data.groupId}`);
    console.log(`userId ${client.user.id} rooms:`, client.rooms);

    client.to(`group-${data.groupId}`).emit('userGroupLeave');
  }

  @SubscribeMessage('onTypingStart')
  onTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(
      `userId ${client.user.id} start typing in conversationId: ${data.conversationId}`
    );

    console.log(`userId ${client.user.id} rooms:`, client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('onTypingStart');
  }

  @SubscribeMessage('onTypingStop')
  onTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(
      `userId ${client.user.id} stop typing in conversationId: ${data.conversationId}`
    );

    console.log(`userId ${client.user.id} rooms:`, client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('onTypingStop');
  }

  @OnEvent(ServerEvents.MESSAGE_CREATED)
  handleMessageCreatedEvent(payload: CreateMessageResponse) {
    const conversationId = payload.conversation.id;
    this.server.to(`conversation-${conversationId}`).emit('onMessage', payload);
  }

  @OnEvent(ServerEvents.CONVERSATION_CREATED)
  handleConversationCreatedEvent(payload: Conversation) {
    const recipientSocket = this.sessions.getUserSocket(payload.recipient.id);
    if (recipientSocket) {
      recipientSocket.emit('onConversation', payload);
    }
  }
}
