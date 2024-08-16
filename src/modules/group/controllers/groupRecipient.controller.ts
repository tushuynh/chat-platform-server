import { Routes, ServerEvents } from '@common/constants/constant';
import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { GroupRecipientService } from '../services/groupRecipient.service';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { User } from '@common/database/entities';
import { AddGroupRecipientDto } from '../dtos/addGroupRecipient.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller(Routes.GROUPS_RECIPIENTS)
export class GroupRecipientController {
  constructor(
    private readonly groupRecipientService: GroupRecipientService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post()
  async addGroupRecipient(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() { username }: AddGroupRecipientDto
  ) {
    const params = { id, userId, username };
    const response = await this.groupRecipientService.addGroupRecipient(params);
    this.eventEmitter.emit(ServerEvents.GROUP_RECIPIENT_ADDED, response);
    return response;
  }

  @Delete('leave')
  async leaveGroup(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) groupId: number
  ) {
    const group = await this.groupRecipientService.leaveGroup({
      id: groupId,
      userId: user.id,
    });
    this.eventEmitter.emit(ServerEvents.GROUP_RECIPIENT_LEFT, {
      group,
      userId: user.id,
    });
    return group;
  }

  @Delete(':userId')
  async removeGroupRecipient(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) removeUserId: number
  ) {
    const params = { userId, groupId, removeUserId };
    const response =
      await this.groupRecipientService.removeGroupRecipient(params);
    this.eventEmitter.emit(ServerEvents.GROUP_RECIPIENT_REMOVED, response);
    return response.group;
  }
}
