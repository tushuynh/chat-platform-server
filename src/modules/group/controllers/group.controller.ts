import { Routes, ServerEvents } from '@common/constants/constant';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GroupService } from '../services/group.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { User } from '@common/database/entities';
import { CreateGroupDto } from '../dtos/createGroup.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateGroupDetailsDto } from '../dtos/updateGroupDetails.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Attachment } from '@shared/types';
import { TransferOwnerDto } from '../dtos/transferOwner.dto';

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
    this.eventEmitter.emit(ServerEvents.GROUP_CREATED, group);
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

  @Patch(':id/details')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateGroupDetails(
    @Body() { title }: UpdateGroupDetailsDto,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() avatar: Attachment
  ) {
    return this.groupService.updateDetails({ id, avatar, title });
  }

  @Patch(':id/owner')
  async updateGroupOwner(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() { newOwnerId }: TransferOwnerDto
  ) {
    const params = { userId, groupId, newOwnerId };
    const group = await this.groupService.transferGroupOwner(params);
    this.eventEmitter.emit(ServerEvents.GROUP_OWNER_UPDATED, group);
    return group;
  }
}
