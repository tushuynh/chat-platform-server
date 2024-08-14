import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketSessionService } from './services/socketSession.service';

@Module({
  imports: [],
  providers: [SocketGateway, SocketSessionService],
  exports: [SocketGateway, SocketSessionService],
})
export class SocketModule {}
