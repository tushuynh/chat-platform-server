import { Friend, FriendRequest } from '@common/database/entities';
import { UserNotFoundException } from '@modules/user/exceptions/UserNotFound.exception';
import { UserService } from '@modules/user/services/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CancelFriendRequestParams,
  CreateFriendParams,
  FriendRequestParams,
} from '@shared/types';
import { Repository } from 'typeorm';
import { FriendRequestException } from '../exceptions/friendRequest.exception';
import { FriendService } from '@modules/friend/services/friend.service';
import { FriendRequestNotFoundException } from '../exceptions/friendRequestNotFound.exception';
import { FriendRequestAcceptedException } from '../exceptions/friendRequestAccepted.exception';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
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

    const isFriend = await this.friendService.isFriend(sender.id, receiver.id);
    if (isFriend) {
      throw new HttpException('Friend already exists', HttpStatus.CONFLICT);
    }

    const friend = this.friendRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });
    return this.friendRequestRepository.save(friend);
  }

  async accept({ id, userId }: FriendRequestParams) {
    const friendRequest = await this.findById(id);
    if (!friendRequest) {
      throw new FriendRequestNotFoundException();
    }

    if (friendRequest.status === 'accepted') {
      throw new FriendRequestAcceptedException();
    }

    if (friendRequest.receiver.id !== userId) {
      throw new FriendRequestException();
    }

    friendRequest.status = 'accepted';
    const updatedFriendRequest =
      await this.friendRequestRepository.save(friendRequest);
    const newFriend = this.friendRepository.create({
      sender: friendRequest.sender,
      receiver: friendRequest.receiver,
    });
    const friend = await this.friendRepository.save(newFriend);
    return {
      friend,
      friendRequest: updatedFriendRequest,
    };
  }

  async cancel({ id, userId }: CancelFriendRequestParams) {
    const friendRequest = await this.findById(id);
    if (!friendRequest) {
      throw new FriendRequestNotFoundException();
    }

    if (friendRequest.sender.id !== userId) {
      throw new FriendRequestException();
    }

    await this.friendRequestRepository.delete(id);
    return friendRequest;
  }

  async reject({ id, userId }: CancelFriendRequestParams) {
    const friendRequest = await this.findById(id);
    if (!friendRequest) {
      throw new FriendRequestNotFoundException();
    }

    if (friendRequest.status === 'accepted') {
      throw new FriendRequestAcceptedException();
    }

    if (friendRequest.receiver.id !== userId) {
      throw new FriendRequestException();
    }

    friendRequest.status = 'rejected';
    return this.friendRequestRepository.save(friendRequest);
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

  findById(id: number): Promise<FriendRequest> {
    return this.friendRequestRepository.findOne({
      where: { id },
      relations: ['receiver', 'sender'],
    });
  }
}
