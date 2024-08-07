import { Routes, ServerEvents } from '@common/constants/constant';
import { User } from '@common/database/entities';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { FriendRequestService } from './services/friend-request.service';
import { CreateFriendDto } from './dtos/CreateFriend.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.FRIEND_REQUESTS)
export class FriendRequestController {
  constructor(
    private readonly friendRequestService: FriendRequestService,
    private readonly event: EventEmitter2
  ) {}

  @Get()
  getFriendRequests(@AuthUser() { id }: User) {
    return this.friendRequestService.getFriendRequests(id);
  }

  @Post()
  async createFriendRequest(
    @AuthUser() user: User,
    @Body() { username }: CreateFriendDto
  ) {
    const params = { user, username };
    const response = await this.friendRequestService.create(params);
    this.event.emit(ServerEvents.FRIEND_REQUEST_ACCEPTED, response);
    return response;
  }
}
