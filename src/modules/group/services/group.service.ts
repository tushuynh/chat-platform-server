import { Group, User } from '@common/database/entities';
import { UserService } from '@modules/user/services/user.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AccessParams,
  CreateGroupParams,
  FetchGroupsParams,
  TransferGroupOwnerParams,
  UpdateGroupDetailsParams,
} from '@shared/types';
import { Repository } from 'typeorm';
import { GroupNotFoundException } from '../exceptions/groupNotFound.exception';
import { generateUUIDV4 } from '@shared/generation';
import { ImageStorageService } from '@modules/imageStorage/services/imageStorage.service';
import { GroupOwnerTransferException } from '../exceptions/groupOwnerTransfer.exception';
import { UserNotFoundException } from '@modules/user/exceptions/UserNotFound.exception';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly userService: UserService,
    private readonly imageStorageService: ImageStorageService
  ) {}

  async createGroup(params: CreateGroupParams) {
    const { creator, title } = params;
    const usersPromise = params.users.map((username) =>
      this.userService.findUser({ username })
    );
    const users = (await Promise.all(usersPromise)).filter((user) => user);
    users.push(creator);

    const groupParams = { owner: creator, users, creator, title };
    const group = this.groupRepository.create(groupParams);
    return this.groupRepository.save(group);
  }

  getGroups(params: FetchGroupsParams): Promise<Group[]> {
    return this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('user.id IN (:users)', { users: [params.userId] })
      .leftJoinAndSelect('group.users', 'users')
      .leftJoinAndSelect('group.creator', 'creator')
      .leftJoinAndSelect('group.owner', 'owner')
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('users.profile', 'usersProfile')
      .leftJoinAndSelect('users.presence', 'usersPresence')
      .orderBy('group.lastMessageSentAt', 'DESC')
      .getMany();
  }

  findGroupById(id: number): Promise<Group> {
    return this.groupRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'users',
        'lastMessageSent',
        'owner',
        'users.profile',
        'users.presence',
      ],
    });
  }

  async updateDetails(params: UpdateGroupDetailsParams): Promise<Group> {
    const group = await this.findGroupById(params.id);
    if (!group) {
      throw new GroupNotFoundException();
    }

    if (params.avatar) {
      const key = generateUUIDV4();
      await this.imageStorageService.upload({
        key,
        file: params.avatar,
      });
      group.avatar = key;
    }

    params.title && (group.title = params.title);
    return this.groupRepository.save(group);
  }

  async transferGroupOwner({
    userId,
    groupId,
    newOwnerId,
  }: TransferGroupOwnerParams): Promise<Group> {
    const group = await this.findGroupById(groupId);
    if (!group) {
      throw new GroupNotFoundException();
    }

    if (group.owner.id !== userId) {
      throw new GroupOwnerTransferException('Insufficient permissions');
    }

    if (group.owner.id === newOwnerId) {
      throw new GroupOwnerTransferException(
        'Cannot transfer owner to yourself'
      );
    }

    const newOwner = await this.userService.findUser({ id: newOwnerId });
    if (!newOwner) {
      throw new UserNotFoundException();
    }

    group.owner = newOwner;
    return this.groupRepository.save(group);
  }

  async hasAccess({ id, userId }: AccessParams): Promise<User | undefined> {
    const group = await this.findGroupById(id);
    if (!group) {
      throw new GroupNotFoundException();
    }

    return group.users.find((user) => user.id === userId);
  }
}
