import { Module } from '@nestjs/common';
import { FriendRequestEvent } from './services/friendRequest.event';
import { SocketModule } from '@modules/socket/socket.module';
import { FriendEvent } from './services/friend.event';

@Module({
  imports: [SocketModule],
  providers: [FriendRequestEvent, FriendEvent],
})
export class EventModule {}
