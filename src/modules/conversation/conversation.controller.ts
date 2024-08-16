import { Routes, ServerEvents } from '@common/constants/constant';
import { User } from '@common/database/entities';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { AuthenticatedGuard } from '@modules/auth/guards/authenticated.guard';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { ConversationService } from './services/conversation.service';

@SkipThrottle()
@UseGuards(AuthenticatedGuard)
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
    this.event.emit(ServerEvents.CONVERSATION_CREATED, conversation);

    return conversation;
  }

  @Get(':id')
  async getConversationById(@Param('id') id: number) {
    return this.conversationService.findById(id);
  }
}
