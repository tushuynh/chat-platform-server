import { Session, User } from '@common/database/entities';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DataSource, Repository } from 'typeorm';
import { AuthenticatedSocket } from './interfaces/authenticatedSocket';
import * as cookie from 'cookie';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';

export class SocketAdapter extends IoAdapter {
  private sessionRepository: Repository<Session>;
  private configService: ConfigService;

  constructor(app: NestExpressApplication) {
    super(app);
    this.sessionRepository = app.get(DataSource).getRepository(Session);
    this.configService = app.get(ConfigService);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const { cookie: clientCookie } = socket.handshake.headers;
      if (!clientCookie) {
        console.log('Client has no cookies');
        return next(new Error('Not authenticated. No cookies were sent'));
      }

      const { CHAT_APP_SESSION_ID } = cookie.parse(clientCookie);
      if (!CHAT_APP_SESSION_ID) {
        console.log('CHAT_APP_SESSION_ID does not exist');
        return next(new Error('Not authenticated'));
      }

      const signedCookie = cookieParser.signedCookie(
        CHAT_APP_SESSION_ID,
        this.configService.get<string>('auth.cookieSecret')
      );
      if (!signedCookie) {
        return next(new Error('Error signing cookie'));
      }

      const session = await this.sessionRepository.findOne({
        where: { id: signedCookie },
      });
      if (!session) {
        return next(new Error('No session found'));
      }

      const userFromSession = JSON.parse(session.json);
      if (!userFromSession.passport || !userFromSession.passport.user) {
        return next(new Error('Passport or user object does not exist'));
      }

      const user = plainToInstance(
        User,
        JSON.parse(session.json).passport.user
      );
      socket.user = user;
      next();
    });

    return server;
  }
}
