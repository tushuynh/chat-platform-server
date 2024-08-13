import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FriendService } from './services/friend.service';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { User } from '@common/database/entities';
import { Routes, ServerEvents } from '@common/constants/constant';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller(Routes.FRIENDS)
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly event: EventEmitter2
  ) {}

  @Get()
  getFriends(@AuthUser() user: User) {
    return this.friendService.getFriends(user.id);
  }

  @Delete(':id/delete')
  async deleteFriend(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number
  ) {
    const friend = await this.friendService.deleteFriend({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REMOVED, { friend, userId });
    return friend;
  }
}
