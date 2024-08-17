import { ServerEvents } from '@common/constants/constant';
import { FriendRequest } from '@common/database/entities';
import { SocketSessionService } from '@modules/socket/services/socketSession.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FriendRequestEvent {
  constructor(private readonly sessions: SocketSessionService) {}

  @OnEvent(ServerEvents.FRIEND_REQUEST_CREATED)
  friendRequestCreate(payload: FriendRequest) {
    const receiverSocket = this.sessions.getUserSocket(payload.receiver.id);
    receiverSocket && receiverSocket.emit('onFriendRequestReceived', payload);
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_CANCELLED)
  handleFriendRequestCancel(payload: FriendRequest) {
    const receiverSocket = this.sessions.getUserSocket(payload.receiver.id);
    receiverSocket && receiverSocket.emit('onFriendRequestCancelled', payload);
  }
}
