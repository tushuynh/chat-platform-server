import { Routes } from '@common/constants/constant';
import { User } from '@common/database/entities';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConversationService } from './services/conversation.service';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.CONVERSATIONS)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly event: EventEmitter2
  ) {}

  @Get()
  async getConversations(@AuthUser() { id }: User) {
    return this.conversationService.getConversations(id);
  }

  @Post()
  async createConversation(
    @AuthUser() user: User,
    @Body() createConversationDto: CreateConversationDto
  ) {
    const conversation = await this.conversationService.createConversation(
      user,
      createConversationDto
    );
    this.event.emit('conversation.create', conversation);

    return conversation;
  }
}
