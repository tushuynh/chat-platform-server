import { Module } from '@nestjs/common';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './services/friend-request.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend, FriendRequest } from '@common/database/entities';
import { UserModule } from '@modules/user/user.module';
import { FriendModule } from '@modules/friend/friend.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest, Friend]),
    UserModule,
    FriendModule,
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
})
export class FriendRequestModule {}
