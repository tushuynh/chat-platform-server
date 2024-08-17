import { ServerEvents } from '@common/constants/constant';
import { FriendRequest } from '@common/database/entities';
import { SocketGateway } from '@modules/socket/socket.gateway';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FriendRequestEvent {
  constructor(private readonly socketGateway: SocketGateway) {}

  @OnEvent(ServerEvents.FRIEND_REQUEST_CREATED)
  friendRequestCreate(payload: FriendRequest) {
    const receiverSocket = this.socketGateway.sessions.getUserSocket(
      payload.receiver.id
    );
    receiverSocket && receiverSocket.emit('onFriendRequestReceived', payload);
  }
}
