import { Routes, ServerEvents } from '@common/constants/constant';
import { User } from '@common/database/entities';
import { AuthUser } from '@common/decorators/authUser.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Throttle } from '@nestjs/throttler';
import { CreateFriendDto } from './dtos/CreateFriend.dto';
import { FriendRequestService } from './services/friend-request.service';

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

  @Throttle({ default: { limit: 3, ttl: 10000 } })
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

  @Throttle({ default: { limit: 3, ttl: 10000 } })
  @Patch(':id/accept')
  async acceptFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number
  ) {
    const response = this.friendRequestService.accept({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REQUEST_ACCEPTED, response);
    return response;
  }
}
