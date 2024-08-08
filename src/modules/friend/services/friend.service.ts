import { Friend } from '@common/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
