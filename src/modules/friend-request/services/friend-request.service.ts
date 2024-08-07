import { FriendRequest } from '@common/database/entities';
import { UserNotFoundException } from '@modules/user/exceptions/UserNotFound.exception';
import { UserService } from '@modules/user/services/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFriendParams } from '@shared/types';
import { Repository } from 'typeorm';
import { FriendRequestException } from '../exceptions/friendRequest.exception';
import { FriendService } from '@modules/friend/services/friend.service';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    private readonly userService: UserService,
    private readonly friendService: FriendService
  ) {}

  getFriendRequests(id: number): Promise<FriendRequest[]> {
    const status = 'pending';
    return this.friendRequestRepository.find({
      where: [
        { sender: { id }, status },
        { receiver: { id }, status },
      ],
      relations: ['receiver', 'sender', 'receiver.profile', 'sender.profile'],
    });
  }

  async create({ user: sender, username }: CreateFriendParams) {
    const receiver = await this.userService.findUser({ username });
    if (!receiver) {
      throw new UserNotFoundException();
    }

    const exists = await this.isPending(sender.id, receiver.id);
    if (exists) {
      throw new HttpException(
        'Friend requesting pending',
        HttpStatus.BAD_REQUEST
      );
    }

    if (receiver.id === sender.id) {
      throw new FriendRequestException('Cannot add yourself');
    }

    const isFriends = await this.friendService.isFriends(
      sender.id,
      receiver.id
    );
    if (isFriends) {
      throw new HttpException('Friend already exists', HttpStatus.CONFLICT);
    }

    const friend = this.friendRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });
    return this.friendRequestRepository.save(friend);
  }

  isPending(userOneId: number, userTwoId: number) {
    return this.friendRequestRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
          status: 'pending',
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
          status: 'pending',
        },
      ],
    });
  }
}
