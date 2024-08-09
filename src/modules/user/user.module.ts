import { Peer, Profile, User, UserPresence } from '@common/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserPresenceController } from './controllers/userPresence.controller';
import { UserPresenceService } from './services/userPresence.service';
import { UserProfileController } from './controllers/userProfile.controller';
import { UserProfileService } from './services/userProfile.service';
import { ImageStorageModule } from '@modules/imageStorage/imageStorage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Peer, UserPresence, Profile]),
    ImageStorageModule,
  ],
  controllers: [UserController, UserPresenceController, UserProfileController],
  providers: [UserService, UserPresenceService, UserProfileService],
  exports: [UserService, UserPresenceService, UserProfileService],
})
export class UserModule {}
