import { Controller, Get } from '@nestjs/common';
import { FriendService } from './services/friend.service';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { User } from '@common/database/entities';
import { Routes } from '@common/constants/constant';

@Controller(Routes.FRIENDS)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  getFriends(@AuthUser() user: User) {
    return this.friendService.getFriends(user.id);
  }
}
