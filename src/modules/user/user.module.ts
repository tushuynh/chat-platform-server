import { Peer, User, UserPresence } from '@common/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserPresenceController } from './controllers/userPresence.controller';
import { UserPresenceService } from './services/userPresence.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Peer, UserPresence])],
  controllers: [UserController, UserPresenceController],
  providers: [UserService, UserPresenceService],
  exports: [UserService, UserPresenceService],
})
export class UserModule {}
