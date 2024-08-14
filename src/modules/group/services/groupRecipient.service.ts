import { UserService } from '@modules/user/services/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AddGroupRecipientParams,
  CheckUserGroupParams,
  LeaveGroupParams,
  RemoveGroupRecipientParams,
} from '@shared/types';
import { GroupService } from './group.service';
import { GroupNotFoundException } from '../exceptions/groupNotFound.exception';
import { GroupParticipantNotFoundException } from '../exceptions/groupParticipantNotFound.exception';
import { NotGroupOwnerException } from '../exceptions/notGroupOwner.exception';

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

  async removeGroupRecipient(params: RemoveGroupRecipientParams) {
    const { userId, removeUserId, groupId } = params;
    const userToBeRemoved = await this.userService.findUser({
      id: removeUserId,
    });
    if (!userToBeRemoved) {
      throw new HttpException('User cannot be removed', HttpStatus.BAD_REQUEST);
    }

    const group = await this.groupService.findGroupById(groupId);
    if (!group) {
      throw new GroupNotFoundException();
    }

    if (group.owner.id !== userId) {
      throw new NotGroupOwnerException();
    }

    if (group.owner.id === removeUserId) {
      throw new HttpException(
        'Cannot remove yourself as owner',
        HttpStatus.BAD_REQUEST
      );
    }

    group.users = group.users.filter((user) => user.id !== removeUserId);
    const savedGroup = await this.groupService.saveGroup(group);
    return { group: savedGroup, user: userToBeRemoved };
  }

  async leaveGroup({ id, userId }: LeaveGroupParams) {
    const group = await this.isUserInGroup({ id, userId });
    if (group.owner.id === userId) {
      throw new HttpException(
        'Cannot leave group as owner',
        HttpStatus.BAD_REQUEST
      );
    }

    group.users = group.users.filter((user) => user.id !== userId);
    return this.groupService.saveGroup(group);
  }

  async isUserInGroup({ id, userId }: CheckUserGroupParams) {
    const group = await this.groupService.findGroupById(id);
    if (!group) {
      throw new GroupNotFoundException();
    }

    const user = group.users.find((user) => user.id === userId);
    if (!user) {
      throw new GroupParticipantNotFoundException();
    }

    return group;
  }
}
