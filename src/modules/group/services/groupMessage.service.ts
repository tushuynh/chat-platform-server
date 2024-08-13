import { GroupMessage } from '@common/database/entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGroupMessageParams } from '@shared/types';
import { Repository } from 'typeorm';
import { GroupService } from './group.service';
import { GroupNotFoundException } from '../exceptions/groupNotFound.exception';
import { instanceToPlain } from 'class-transformer';
import { MessageAttachmentService } from '@modules/messageAttachment/services/messageAttachment.service';

@Injectable()
export class GroupMessageService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
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
}
