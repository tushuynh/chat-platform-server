import { Friend } from '@common/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteFriendRequestParams } from '@shared/types';
import { Repository } from 'typeorm';
import { FriendNotFoundException } from '../exceptions/friendNotFound.exception';
import { DeleteFriendException } from '../exceptions/deleteFriend.exception';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>
  ) {}

  getFriends(id: number): Promise<Friend[]> {
    return this.friendRepository.find({
      where: [{ sender: { id } }, { receiver: { id } }],
      relations: [
        'sender',
        'receiver',
        'sender.profile',
        'receiver.profile',
        'receiver.presence',
        'sender.presence',
      ],
    });
  }

  async deleteFriend({ id, userId }: DeleteFriendRequestParams) {
    const friend = await this.findFriendById(id);
    if (!friend) {
      throw new FriendNotFoundException();
    }

    if (friend.receiver.id !== userId && friend.sender.id !== userId) {
      throw new DeleteFriendException();
    }

    await this.friendRepository.delete(id);
    return friend;
  }

  findFriendById(id: number): Promise<Friend> {
    return this.friendRepository.findOne({
      where: { id },
      relations: [
        'sender',
        'receiver',
        'sender.profile',
        'sender.presence',
        'receiver.profile',
        'receiver.presence',
      ],
    });
  }

  isFriend(userOneId: number, userTwoId: number) {
    return this.friendRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
        },
      ],
    });
  }
}
