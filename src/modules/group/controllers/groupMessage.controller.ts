import { Routes, ServerEvents } from '@common/constants/constant';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GroupMessageService } from '../services/groupMessage.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { Attachment } from '@shared/types';
import { User } from '@common/database/entities';
import { CreateMessageDto } from '@modules/messages/dtos/CreateMessage.dto';
import { EmptyMessageException } from '@modules/messages/exceptions/emptyMessage.exception';
import { EditMessageDto } from '@modules/messages/dtos/editMessage.dto';

@Controller(Routes.GROUPS_MESSAGES)
export class GroupMessageController {
  constructor(
    private readonly groupMessageService: GroupMessageService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @SkipThrottle()
  @Get()
  async getGroupMessages(@Param('id', ParseIntPipe) id: number) {
    const messages = await this.groupMessageService.getGroupMessages(id);
    return { id, messages };
  }

  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'attachments',
        maxCount: 5,
      },
    ])
  )
  @Post()
  async createGroupMessage(
    @AuthUser() user: User,
    @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Param('id', ParseIntPipe) id: number,
    @Body() { content }: CreateMessageDto
  ) {
    if (!attachments && !content) {
      throw new EmptyMessageException();
    }

    const params = { groupId: id, author: user, content, attachments };
    const response = await this.groupMessageService.createGroupMessages(params);
    this.eventEmitter.emit(ServerEvents.GROUP_MESSAGE_CREATED, response);
    return;
  }

  @SkipThrottle()
  @Patch(':messageId')
  async editGroupMessage(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() { content }: EditMessageDto
  ) {
    const params = { userId, content, groupId, messageId };
    const message = await this.groupMessageService.editGroupMessage(params);
    this.eventEmitter.emit(ServerEvents.GROUP_MESSAGE_UPDATED, message);
    return message;
  }
}
