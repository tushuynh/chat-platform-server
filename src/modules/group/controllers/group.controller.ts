import { Routes, ServerEvents } from '@common/constants/constant';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupService } from '../services/group.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { User } from '@common/database/entities';
import { CreateGroupDto } from '../dtos/createGroup.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller(Routes.GROUPS)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post()
  async createGroup(@AuthUser() user: User, @Body() payload: CreateGroupDto) {
    const group = await this.groupService.createGroup({
      ...payload,
      creator: user,
    });
    this.eventEmitter.emit(ServerEvents.GROUP_CREATED);
    return group;
  }

  @Get()
  getGroups(@AuthUser() user: User) {
    return this.groupService.getGroups({ userId: user.id });
  }

  @Get(':id')
  getGroup(@Param(':id') id: number) {
    return this.groupService.findGroupById(id);
  }
}
