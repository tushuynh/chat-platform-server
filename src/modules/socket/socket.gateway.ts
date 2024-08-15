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
import { Socket } from 'socket.io';
import { AuthenticatedSocket } from './interfaces/authenticatedSocket';
import { SocketSessionService } from './services/socketSession.service';
import { GroupService } from '@modules/group/services/group.service';

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
  server: Socket;

  constructor(
    private readonly sessions: SocketSessionService,
    private readonly groupService: GroupService
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
}
