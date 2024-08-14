import { User } from '@common/database/entities';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user?: User;
}
