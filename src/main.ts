import { Session } from '@common/database/entities';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TypeormStore } from 'connect-typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { ExpressPeerServer } from 'peer';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { SocketAdapter } from '@modules/socket/socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const globalPrefix = configService.get<string>('app.globalPrefix');
  const allowOrigin = configService.get<string>('auth.cors.allowOrigin');

  const logger = new Logger(AppModule.name);
  const sessionRepository = app.get(DataSource).getRepository(Session);

  const socketAdapter = new SocketAdapter(app);
  app.useWebSocketAdapter(socketAdapter);

  app.setGlobalPrefix(globalPrefix);
  app.enableCors({ origin: allowOrigin, credentials: true });
  app.useGlobalPipes(new ValidationPipe());

  app.set('trust proxy', 'loopback');
  app.use(
    session({
      secret: configService.get<string>('auth.cookieSecret'),
      saveUninitialized: false,
      resave: false,
      name: 'CHAT_APP_SESSION_ID',
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // cookie expires 1 day later
      },
      store: new TypeormStore().connect(sessionRepository),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  const server = app.getHttpServer();
  const peerServer = ExpressPeerServer(server);
  app.use('/peerjs', peerServer);

  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}${globalPrefix}`);
}
bootstrap();
