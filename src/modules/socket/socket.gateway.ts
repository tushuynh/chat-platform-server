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
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './interfaces/authenticatedSocket';
import { SocketSessionService } from './services/socketSession.service';
import { GroupService } from '@modules/group/services/group.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ServerEvents } from '@common/constants/constant';
import {
  AddGroupUserResponse,
  CreateGroupMessageResponse,
  CreateMessageResponse,
  DeleteMessageParams,
  RemoveGroupUserResponse,
} from '@shared/types';
import {
  Conversation,
  Group,
  GroupMessage,
  Message,
} from '@common/database/entities';
import { ConversationService } from '@modules/conversation/services/conversation.service';

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
  server: Server;

  constructor(
    private readonly sessions: SocketSessionService,
    private readonly groupService: GroupService,
    private readonly conversationService: ConversationService
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

  @OnEvent(ServerEvents.MESSAGE_DELETED)
  async handleMessageDelete(payload: DeleteMessageParams) {
    const conversation = await this.conversationService.findById(
      payload.conversationId
    );
    if (!conversation) {
      return;
    }

    const { creator, recipient } = conversation;
    const recipientSocket =
      creator.id === payload.userId
        ? this.sessions.getUserSocket(recipient.id)
        : this.sessions.getUserSocket(creator.id);
    if (recipientSocket) recipientSocket.emit('onMessageDelete', payload);
  }

  @OnEvent(ServerEvents.MESSAGE_UPDATED)
  async handleMessageUpdate(message: Message) {
    const {
      author,
      conversation: { creator, recipient },
    } = message;

    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(recipient.id)
        : this.sessions.getUserSocket(creator.id);
    if (recipientSocket) recipientSocket.emit('onMessageUpdate', message);
  }

  @OnEvent(ServerEvents.GROUP_CREATED)
  handleGroupCreated(payload: Group) {
    payload.users.forEach((user) => {
      const socket = this.sessions.getUserSocket(user.id);
      socket && socket.emit('onGroupCreate', payload);
    });
  }

  @OnEvent(ServerEvents.GROUP_MESSAGE_CREATED)
  handleGroupMessageCreated(payload: CreateGroupMessageResponse) {
    const groupId = payload.group.id;
    this.server.to(`group-${groupId}`).emit('onGroupMessage', payload);
  }

  @OnEvent(ServerEvents.GROUP_MESSAGE_UPDATED)
  handleGroupMessageUpdated(payload: GroupMessage) {
    const room = `group-${payload.group.id}`;
    this.server.to(room).emit('onGroupMessageUpdate', payload);
  }

  @OnEvent(ServerEvents.GROUP_USER_ADDED)
  handleGroupUserAdd(payload: AddGroupUserResponse) {
    const recipientSocket = this.sessions.getUserSocket(payload.user.id);
    const room = `group-${payload.group.id}`;

    this.server.to(room).emit('onGroupReceivedNewUser', payload);
    recipientSocket && recipientSocket.emit('onGroupUserAdd', payload);
  }

  @OnEvent(ServerEvents.GROUP_USER_REMOVED)
  handleGroupUserRemoved(payload: RemoveGroupUserResponse) {
    const { group, user } = payload;
    const room = `group-${group.id}`;

    const removedUserSocket = this.sessions.getUserSocket(user.id);
    if (removedUserSocket) {
      removedUserSocket.emit('onGroupRemoved', payload);
      removedUserSocket.leave(room);
    }

    this.server.to(room).emit('onGroupRecipientRemoved', payload);
  }

  @OnEvent(ServerEvents.GROUP_OWNER_UPDATED)
  handleGroupOwnerUpdate(payload: Group) {
    const roomName = `group-${payload.id}`;
    const newOwnerSocket = this.sessions.getUserSocket(payload.owner.id);

    const { rooms } = this.server.sockets.adapter;
    const socketsInRoom = rooms.get(roomName);

    this.server.to(roomName).emit('onGroupOwnerUpdate', payload);
    if (newOwnerSocket && !socketsInRoom.has(newOwnerSocket.id)) {
      newOwnerSocket.emit('onGroupOwnerUpdate', payload);
    }
  }
}
