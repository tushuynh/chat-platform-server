import {
  ConnectedSocket,
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
import { ServerEvents, WebsocketEvents } from '@common/constants/constant';
import {
  AddGroupUserResponse,
  CallAcceptedPayload,
  CallHangUpPayload,
  CallRejectedPayload,
  CreateCallPayload,
  CreateGroupMessageResponse,
  CreateMessageResponse,
  DeleteMessageParams,
  LeaveGroupEventPayload,
  RemoveGroupUserResponse,
  VoiceCallPayload,
} from '@shared/types';
import {
  Conversation,
  Group,
  GroupMessage,
  Message,
} from '@common/database/entities';
import { ConversationService } from '@modules/conversation/services/conversation.service';
import { FriendService } from '@modules/friend/services/friend.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    readonly sessions: SocketSessionService,
    private readonly groupService: GroupService,
    private readonly conversationService: ConversationService,
    private readonly friendService: FriendService
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

  @SubscribeMessage('onGroupTypingStart')
  onGroupTypingStart(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(
      `userId ${client.user.id} start typing in groupId: ${data.groupId}`
    );

    console.log(`userId ${client.user.id} rooms:`, client.rooms);
    client.to(`group-${data.groupId}`).emit('onGroupTypingStart', client.user);
  }

  @SubscribeMessage('onGroupTypingStop')
  onGroupTypingStop(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    console.log(
      `userId ${client.user.id} stop typing in groupId: ${data.groupId}`
    );

    console.log(`userId ${client.user.id} rooms:`, client.rooms);
    client.to(`group-${data.groupId}`).emit('onGroupTypingStop', client.user);
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

  @OnEvent(ServerEvents.GROUP_USER_LEFT)
  handleGroupUserLeft(payload: LeaveGroupEventPayload) {
    const roomName = `group-${payload.group.id}`;
    const { rooms } = this.server.sockets.adapter;
    const socketsInRoom = rooms.get(roomName);
    const leftUserSocket = this.sessions.getUserSocket(payload.userId);
    console.log(`Sockets in the room: `, socketsInRoom);
    console.log(`Left user socket id: `, leftUserSocket.id);

    /**
     * If socketsInRoom is undefined, this means that there is
     * no one connected to the room. So just emit the event for
     * the connected user if they are online.
     */
    if (leftUserSocket && socketsInRoom) {
      // User is online, at least 1 person is in the room
      if (socketsInRoom.has(leftUserSocket.id)) {
        // User is in the room
        return this.server.to(roomName).emit('onGroupParticipantLeft', payload);
      } else {
        // User not in the room
        leftUserSocket.emit('onGroupParticipantLeft', payload);
        return this.server.to(roomName).emit('onGroupParticipantLeft', payload);
      }
    }

    if (leftUserSocket && !socketsInRoom) {
      // User is online but there are no sockets in the room
      return leftUserSocket.emit('onGroupParticipantLeft', payload);
    }
  }

  @SubscribeMessage('getOnlineFriends')
  async handleFriendListRetrieve(
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const { user } = socket;
    if (user) {
      const friends = await this.friendService.getFriends(user.id);
      const onlineFriends = friends.filter((friend) =>
        this.sessions.getUserSocket(
          user.id === friend.receiver.id ? friend.sender.id : friend.receiver.id
        )
      );
      socket.emit('getOnlineFriends', onlineFriends);
    }
  }

  @SubscribeMessage(WebsocketEvents.VIDEO_CALL_INITIATE)
  async handleVideoCallInitiate(
    @MessageBody() data: CreateCallPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const caller = socket.user;
    const receiverSocket = this.sessions.getUserSocket(data.recipientId);
    if (!receiverSocket) {
      return socket.emit('onUserUnavailable');
    }

    receiverSocket.emit('onVideoCall', { ...data, caller });
  }

  @SubscribeMessage(WebsocketEvents.VIDEO_CALL_ACCEPTED)
  async handleVideoCallAccepted(
    @MessageBody() data: CallAcceptedPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const callerSocket = this.sessions.getUserSocket(data.caller.id);
    if (!callerSocket) {
      console.log('Caller is offline');
      return;
    }

    const conversation = await this.conversationService.isCreated(
      data.caller.id,
      socket.user.id
    );
    if (!conversation) {
      console.log('Conversation not found');
      return;
    }

    const payload = { ...data, conversation, acceptor: socket.user };
    callerSocket.emit('onVideoCallAccept', payload);
    socket.emit('onVideoCallAccept', payload);
  }

  @SubscribeMessage(WebsocketEvents.VIDEO_CALL_REJECTED)
  async handleVideoCallRejected(
    @MessageBody() data: CallRejectedPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const receiver = socket.user;
    const callerSocket = this.sessions.getUserSocket(data.caller.id);

    callerSocket &&
      callerSocket.emit(WebsocketEvents.VIDEO_CALL_REJECTED, { receiver });
    socket.emit(WebsocketEvents.VIDEO_CALL_REJECTED, { receiver });
  }

  @SubscribeMessage(WebsocketEvents.VIDEO_CALL_HANG_UP)
  async handleVideoCallHangUp(
    @MessageBody() { caller, receiver }: CallHangUpPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const receiverSocket =
      socket.user.id === caller.id
        ? this.sessions.getUserSocket(receiver.id)
        : this.sessions.getUserSocket(caller.id);

    socket.emit(WebsocketEvents.VIDEO_CALL_HANG_UP);
    receiverSocket && receiverSocket.emit(WebsocketEvents.VIDEO_CALL_HANG_UP);
  }

  @SubscribeMessage(WebsocketEvents.VOICE_CALL_INITIATE)
  async handleVoiceCallInitiate(
    @MessageBody() payload: VoiceCallPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const caller = socket.user;
    const receiverSocket = this.sessions.getUserSocket(payload.recipientId);
    if (!receiverSocket) {
      return socket.emit('onUserUnavailable');
    }

    receiverSocket.emit('onVoiceCall', { ...payload, caller });
  }

  @SubscribeMessage(WebsocketEvents.VOICE_CALL_ACCEPTED)
  async handleVoiceCallAccepted(
    @MessageBody() payload: CallAcceptedPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const callerSocket = this.sessions.getUserSocket(payload.caller.id);
    if (!callerSocket) {
      console.log('Caller is offline');
      return;
    }

    const conversation = await this.conversationService.isCreated(
      payload.caller.id,
      socket.user.id
    );
    if (!conversation) {
      console.log('No conversation found');
      return;
    }

    const callPayload = { ...payload, conversation, acceptor: socket.user };
    callerSocket.emit(WebsocketEvents.VOICE_CALL_ACCEPTED, callPayload);
    socket.emit(WebsocketEvents.VOICE_CALL_ACCEPTED, callPayload);
  }

  @SubscribeMessage(WebsocketEvents.VOICE_CALL_REJECTED)
  async handleVoiceCallRejected(
    @MessageBody() data: CallRejectedPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const receiver = socket.user;
    const callerSocket = this.sessions.getUserSocket(data.caller.id);

    callerSocket &&
      callerSocket.emit(WebsocketEvents.VOICE_CALL_REJECTED, { receiver });
    socket.emit(WebsocketEvents.VOICE_CALL_REJECTED, { receiver });
  }

  @SubscribeMessage(WebsocketEvents.VOICE_CALL_HANG_UP)
  async handleVoiceCallHangUp(
    @MessageBody() { caller, receiver }: CallHangUpPayload,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const receiverSocket =
      socket.user.id === caller.id
        ? this.sessions.getUserSocket(receiver.id)
        : this.sessions.getUserSocket(caller.id);

    socket.emit(WebsocketEvents.VOICE_CALL_HANG_UP);
    receiverSocket && receiverSocket.emit(WebsocketEvents.VOICE_CALL_HANG_UP);
  }
}
