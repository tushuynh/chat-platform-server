import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketSessionService } from './services/socketSession.service';
import { GroupModule } from '@modules/group/group.module';

@Module({
  imports: [GroupModule],
  providers: [SocketGateway, SocketSessionService],
  exports: [SocketGateway, SocketSessionService],
})
export class SocketModule {}
