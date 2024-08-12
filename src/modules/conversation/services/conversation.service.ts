import { Conversation, Message, User } from '@common/database/entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversationDto } from '../dtos/CreateConversation.dto';
import { UserService } from '@modules/user/services/user.service';
import { CreateConversationException } from '../exceptions/createConversation.exception';
import { FriendService } from '@modules/friend/services/friend.service';
import { FriendNotFoundException } from '@modules/friend/exceptions/friendNotFound.exception';
import { UserNotFoundException } from '@modules/user/exceptions/UserNotFound.exception';
import {
  AccessParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from '@shared/types';
import { ConversationNotFoundException } from '../exceptions/conversationNotFound.exception';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly friendService: FriendService
  ) {}

  async getConversations(id: number): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.recipient', 'recipient')
      .leftJoinAndSelect('creator.peer', 'creatorPeer')
      .leftJoinAndSelect('recipient.peer', 'recipientPeer')
      .leftJoinAndSelect('creator.profile', 'creatorProfile')
      .leftJoinAndSelect('recipient.profile', 'recipientProfile')
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('conversation.lastMessageSentAt', 'DESC')
      .getMany();
  }

  async findById(id: number) {
    return this.conversationRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'recipient',
        'creator.profile',
        'recipient.profile',
        'lastMessageSent',
      ],
    });
  }

  async isCreated(userId: number, recipientId: number) {
    return this.conversationRepository.findOne({
      where: [
        {
          creator: { id: userId },
          recipient: { id: recipientId },
        },
        {
          creator: { id: recipientId },
          recipient: { id: userId },
        },
      ],
    });
  }

  async createConversation(creator: User, params: CreateConversationDto) {
    const { username, message: content } = params;
    const recipient = await this.userService.findUser({ username });
    if (!recipient) {
      throw new UserNotFoundException();
    }

    if (creator.id === recipient.id) {
      throw new CreateConversationException(
        'Cannot create conversation with yourself'
      );
    }

    const isFriend = await this.friendService.isFriend(
      creator.id,
      recipient.id
    );
    if (!isFriend) {
      throw new FriendNotFoundException();
    }

    const exists = await this.isCreated(creator.id, recipient.id);
    if (exists) {
      throw new HttpException(
        'Conversation Already Exists',
        HttpStatus.CONFLICT
      );
    }

    const newConversation = this.conversationRepository.create({
      creator,
      recipient,
    });
    const conversation =
      await this.conversationRepository.save(newConversation);
    const newMessage = this.messageRepository.create({
      content,
      conversation,
      author: creator,
    });
    await this.messageRepository.save(newMessage);

    return conversation;
  }

  save(conversation: Conversation): Promise<Conversation> {
    return this.conversationRepository.save(conversation);
  }

  async hasAccess({ id, userId }: AccessParams) {
    const conversation = await this.findById(id);
    if (!conversation) {
      throw new ConversationNotFoundException();
    }

    return (
      conversation.creator.id === userId || conversation.recipient.id === userId
    );
  }

  async getMessages({
    id,
    limit,
  }: GetConversationMessagesParams): Promise<Conversation> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where('id = :id', { id })
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getOne();
  }

  update({ id, lastMessageSent }: UpdateConversationParams) {
    return this.conversationRepository.update(id, { lastMessageSent });
  }
}
