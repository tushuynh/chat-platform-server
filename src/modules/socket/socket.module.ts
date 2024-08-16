import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketSessionService } from './services/socketSession.service';
import { GroupModule } from '@modules/group/group.module';
import { ConversationModule } from '@modules/conversation/conversation.module';

@Module({
  imports: [GroupModule, ConversationModule],
  providers: [SocketGateway, SocketSessionService],
  exports: [SocketGateway, SocketSessionService],
})
export class SocketModule {}
