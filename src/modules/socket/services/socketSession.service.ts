import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from '../interfaces/authenticatedSocket';

@Injectable()
export class SocketSessionService {
  private readonly sessions: Map<number, AuthenticatedSocket> = new Map();

  setUserSocket(userId: number, socket: AuthenticatedSocket) {
    this.sessions.set(userId, socket);
  }

  getUserSocket(userId: number) {
    return this.sessions.get(userId);
  }

  removeUserSocket(userId: number) {
    this.sessions.delete(userId);
  }

  getSockets(): Map<number, AuthenticatedSocket> {
    return this.sessions;
  }
}
