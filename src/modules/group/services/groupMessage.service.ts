import { Group, GroupMessage } from '@common/database/entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateGroupMessageParams,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
  GetGroupMessagesParams,
} from '@shared/types';
import { Repository } from 'typeorm';
import { GroupService } from './group.service';
import { GroupNotFoundException } from '../exceptions/groupNotFound.exception';
import { instanceToPlain } from 'class-transformer';
import { MessageAttachmentService } from '@modules/messageAttachment/services/messageAttachment.service';
import { CannotDeleteMessageException } from '@modules/messages/exceptions/cannotDeleteMessage.exception';

@Injectable()
export class GroupMessageService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly groupService: GroupService,
    private readonly messageAttachmentService: MessageAttachmentService
  ) {}

  getGroupMessages(id: number): Promise<GroupMessage[]> {
    return this.groupMessageRepository.find({
      where: { group: { id } },
      relations: ['author', 'attachments', 'author.profile'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createGroupMessages({
    groupId: id,
    ...params
  }: CreateGroupMessageParams) {
    const { content, author } = params;

    const group = await this.groupService.findGroupById(id);
    if (!group) {
      throw new GroupNotFoundException();
    }

    const findUser = group.users.find((user) => user.id === author.id);
    if (!findUser) {
      throw new HttpException('User not in group', HttpStatus.BAD_REQUEST);
    }

    const groupMessage = this.groupMessageRepository.create({
      content,
      group,
      author: instanceToPlain(author),
      attachments: params.attachments
        ? await this.messageAttachmentService.createGroupAttachments(
            params.attachments
          )
        : [],
    });
    const saveMessage = await this.groupMessageRepository.save(groupMessage);
    group.lastMessageSent = saveMessage;
    const updatedGroup = await this.groupService.saveGroup(group);
    return { message: saveMessage, group: updatedGroup };
  }

  async editGroupMessage(params: EditGroupMessageParams) {
    const message = await this.groupMessageRepository.findOne({
      where: {
        id: params.messageId,
        author: { id: params.userId },
      },
      relations: ['group', 'group.creator', 'group.users', 'author'],
    });
    if (!message) {
      throw new HttpException('Cannot edit message', HttpStatus.BAD_REQUEST);
    }

    message.content = params.content;
    return this.groupMessageRepository.save(message);
  }

  async deleteGroupMessage(params: DeleteGroupMessageParams) {
    const group = await this.getMessages({ id: params.groupId, limit: 5 });
    if (!group) {
      throw new GroupNotFoundException();
    }

    const message = await this.groupMessageRepository.findOne({
      where: {
        id: params.messageId,
        author: { id: params.userId },
        group: { id: params.groupId },
      },
    });
    if (!message) {
      throw new CannotDeleteMessageException();
    }

    if (group.lastMessageSent.id !== message.id) {
      return this.groupMessageRepository.delete({ id: message.id });
    }

    return this.deleteLastMessage(group, message);
  }

  getMessages({ id, limit }: GetGroupMessagesParams) {
    return this.groupRepository
      .createQueryBuilder('group')
      .where('group.id = :groupId', { groupId: id })
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('group.messages', 'messages')
      .orderBy('messages.createdAt', 'DESC')
      .limit(limit)
      .getOne();
  }

  async deleteLastMessage(group: Group, message: GroupMessage) {
    const size = group.messages.length;
    const SECOND_MESSAGE_INDEX = 1;

    if (size <= 1) {
      await this.groupRepository.update(
        { id: group.id },
        { lastMessageSent: null }
      );
    } else {
      const newLastMessage = group.messages[SECOND_MESSAGE_INDEX];
      await this.groupRepository.update(
        { id: group.id },
        { lastMessageSent: newLastMessage }
      );
    }

    return this.groupMessageRepository.delete({ id: message.id });
  }
}
