import { Routes } from '@common/constants/constant';
import { User } from '@common/database/entities';
import { AuthUser } from '@common/decorators/authUser.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Attachment } from '@shared/types';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { EmptyMessageException } from './exceptions/emptyMessage.exception';
import { MessageService } from './services/message.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.MESSAGES)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private eventEmitter: EventEmitter2
  ) {}

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
  async createMessage(
    @AuthUser() user: User,
    @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Param('id', ParseIntPipe) id: number,
    @Body() { content }: CreateMessageDto
  ) {
    if (!attachments && !content) {
      throw new EmptyMessageException();
    }
    const params = { user, id, content, attachments };
    const response = await this.messageService.createMessage(params);
    this.eventEmitter.emit('message.create', response);
    return;
  }

  @SkipThrottle()
  @Get()
  async getMessagesFromConversation(@Param('id', ParseIntPipe) id: number) {
    const messages = await this.messageService.getMessages(id);
    return { id, messages };
  }
}
