import { ServerEvents } from '@common/constants/constant';
import { SocketSessionService } from '@modules/socket/services/socketSession.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RemoveFriendEventPayload } from '@shared/types';

@Injectable()
export class FriendEvent {
  constructor(private readonly sessions: SocketSessionService) {}

  @OnEvent(ServerEvents.FRIEND_REMOVED)
  handleFriendRemoved({ userId, friend }: RemoveFriendEventPayload) {
    console.log('in friend removed event');
    const { sender, receiver } = friend;
    const socket = this.sessions.getUserSocket(
      userId === receiver.id ? sender.id : receiver.id
    );

    socket && socket.emit('onFriendRemoved', friend);
  }
}
