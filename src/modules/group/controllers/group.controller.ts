import { Routes } from '@common/constants/constant';
import { Controller, Get } from '@nestjs/common';
import { GroupService } from '../services/group.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { User } from '@common/database/entities';

@Controller(Routes.GROUPS)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Get()
  getGroups(@AuthUser() user: User) {
    return this.groupService.getGroups({ userId: user.id });
  }
}
