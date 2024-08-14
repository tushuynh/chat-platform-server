import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthenticatedSocket } from './interfaces/authenticatedSocket';
import { SocketSessionService } from './services/socketSession.service';

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

  constructor(private readonly sessions: SocketSessionService) {}

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log(`${socket.user.username} connected`);
    this.sessions.setUserSocket(socket.user.id, socket);
    socket.emit('connected', {});
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`${socket.user.username} disconnected`);
    this.sessions.removeUserSocket(socket.user.id);
  }
}
