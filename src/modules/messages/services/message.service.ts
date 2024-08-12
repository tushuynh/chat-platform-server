import { Conversation, Message } from '@common/database/entities';
import { ConversationNotFoundException } from '@modules/conversation/exceptions/conversationNotFound.exception';
import { ConversationService } from '@modules/conversation/services/conversation.service';
import { FriendNotFoundException } from '@modules/friend/exceptions/friendNotFound.exception';
import { FriendService } from '@modules/friend/services/friend.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateMessageParams,
  DeleteMessageParams,
  EditMessageParams,
} from '@shared/types';
import { Repository } from 'typeorm';
import { CannotCreateMessageException } from '../exceptions/cannotCreateMessage.exception';
import { instanceToPlain } from 'class-transformer';
import { MessageAttachmentService } from '@modules/messageAttachment/services/messageAttachment.service';
import { buildFindMessageParams } from '@shared/builder';
import { CannotDeleteMessageException } from '../exceptions/cannotDeleteMessage.exception';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conversationService: ConversationService,
    private readonly friendService: FriendService,
    private readonly messageAttachmentService: MessageAttachmentService
  ) {}

  async createMessage(params: CreateMessageParams) {
    const { user, content, id } = params;

    const conversation = await this.conversationService.findById(id);
    if (!conversation) {
      throw new ConversationNotFoundException();
    }

    const { creator, recipient } = conversation;
    const isFriend = await this.friendService.isFriend(
      creator.id,
      recipient.id
    );
    if (!isFriend) {
      throw new FriendNotFoundException();
    }

    if (creator.id !== user.id && recipient.id !== user.id) {
      throw new CannotCreateMessageException();
    }

    const message = this.messageRepository.create({
      content,
      conversation,
      author: instanceToPlain(user),
      attachments: params.attachments
        ? await this.messageAttachmentService.create(params.attachments)
        : [],
    });
    const savedMessage = await this.messageRepository.save(message);
    conversation.lastMessageSent = savedMessage;
    const updated = await this.conversationService.save(conversation);
    return {
      message: savedMessage,
      conversation: updated,
    };
  }

  async getMessages(conversationId: number) {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['author', 'attachments', 'author.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async editMessage(params: EditMessageParams) {
    const message = await this.messageRepository.findOne({
      where: {
        id: params.messageId,
        author: { id: params.userId },
      },
      relations: [
        'conversation',
        'conversation.creator',
        'conversation.recipient',
        'author',
        'author.profile',
      ],
    });
    if (!message) {
      throw new HttpException('Cannot edit message', HttpStatus.BAD_REQUEST);
    }

    message.content = params.content;
    return this.messageRepository.save(message);
  }

  async deleteMessage(params: DeleteMessageParams) {
    const { conversationId } = params;
    const msgParams = { id: conversationId, limit: 5 };
    const conversation = await this.conversationService.getMessages(msgParams);
    if (!conversation) {
      throw new ConversationNotFoundException();
    }

    const findMessageParams = buildFindMessageParams(params);
    const message = await this.messageRepository.findOne({
      where: findMessageParams,
    });
    if (!message) {
      throw new CannotDeleteMessageException();
    }

    if (conversation.lastMessageSent.id !== message.id) {
      return this.messageRepository.delete({ id: message.id });
    }

    return this.deleteLastMessage(conversation, message);
  }

  async deleteLastMessage(conversation: Conversation, message: Message) {
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1;

    if (size <= 1) {
      await this.conversationService.update({
        id: conversation.id,
        lastMessageSent: null,
      });
    } else {
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
      await this.conversationService.update({
        id: conversation.id,
        lastMessageSent: newLastMessage,
      });
    }

    return this.messageRepository.delete({ id: message.id });
  }
}
