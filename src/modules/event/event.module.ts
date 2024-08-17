import { Module } from '@nestjs/common';
import { FriendRequestEvent } from './friendRequest.event';
import { SocketModule } from '@modules/socket/socket.module';

@Module({
  imports: [SocketModule],
  providers: [FriendRequestEvent],
})
export class EventModule {}
