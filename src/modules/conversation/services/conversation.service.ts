import { Conversation, Message, User } from '@common/database/entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversationDto } from '../dtos/CreateConversation.dto';
import { UserService } from '@modules/user/services/user.service';
import { CreateConversationException } from '../exceptions/CreateConversation.exception';
import { FriendService } from '@modules/friend/services/friend.service';
import { FriendNotFoundException } from '@modules/friend/exceptions/friendNotFound.exception';
import { UserNotFoundException } from '@modules/user/exceptions/UserNotFound.exception';

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

    const isFriends = await this.friendService.isFriends(
      creator.id,
      recipient.id
    );
    if (!isFriends) {
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
}
