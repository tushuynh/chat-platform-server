import { Routes, ServerEvents } from '@common/constants/constant';
import { User } from '@common/database/entities';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { ConversationService } from '@modules/conversation/services/conversation.service';
import { UserService } from '@modules/user/services/user.service';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.EXISTS)
export class ExistController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
    private readonly event: EventEmitter2
  ) {}

  @Get('conversations/:recipientId')
  async checkConversationExists(
    @AuthUser() user: User,
    @Param('recipientId', ParseIntPipe) recipientId: number
  ) {
    const conversation = await this.conversationService.isCreated(
      recipientId,
      user.id
    );
    if (conversation) {
      return conversation;
    }

    const recipient = await this.userService.findUser({ id: recipientId });
    if (!recipient) {
      throw new HttpException('Recipient not found', HttpStatus.NOT_FOUND);
    }

    const newConversation = await this.conversationService.createConversation(
      user,
      {
        username: recipient.username,
        message: 'hello',
      }
    );

    this.event.emit(ServerEvents.CONVERSATION_CREATED, newConversation);
    return newConversation;
  }
}
