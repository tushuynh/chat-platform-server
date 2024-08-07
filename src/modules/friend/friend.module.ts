import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './services/friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from '@common/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Friend])],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
