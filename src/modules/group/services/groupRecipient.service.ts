import { UserService } from '@modules/user/services/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AddGroupRecipientParams } from '@shared/types';
import { GroupService } from './group.service';
import { GroupNotFoundException } from '../exceptions/groupNotFound.exception';

@Injectable()
export class GroupRecipientService {
  constructor(
    private readonly groupService: GroupService,
    private readonly userService: UserService
  ) {}

  async addGroupRecipient(params: AddGroupRecipientParams) {
    const group = await this.groupService.findGroupById(params.id);
    if (!group) {
      throw new GroupNotFoundException();
    }

    if (group.owner.id !== params.id) {
      throw new HttpException(
        'Insufficient permissions',
        HttpStatus.BAD_REQUEST
      );
    }

    const recipient = await this.userService.findUser({
      username: params.username,
    });
    if (!recipient) {
      throw new HttpException('Cannot add user', HttpStatus.BAD_REQUEST);
    }

    const isGroup = group.users.find((user) => user.id === recipient.id);
    if (isGroup) {
      throw new HttpException('User already in group', HttpStatus.BAD_REQUEST);
    }

    group.users.push(recipient);
    const savedGroup = await this.groupService.saveGroup(group);
    return { group: savedGroup, user: recipient };
  }
}
