import { Peer, User } from '@common/database/entities';
import { CreateUserDto } from '@modules/auth/dtos/CreateUser.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindUserOptions, FindUserParams } from '@shared/types';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Peer)
    private readonly peerRopository: Repository<Peer>
  ) {}

  async createUser(createUserDto: CreateUserDto, hashedPassword: string) {
    const peer = this.peerRopository.create();
    const params = { ...createUserDto, password: hashedPassword, peer };
    const newUser = this.userRepository.create(params);
    return this.userRepository.save(newUser);
  }

  async findUser(
    params: FindUserParams,
    options?: FindUserOptions
  ): Promise<User> {
    const selections: (keyof User)[] = [
      'email',
      'username',
      'firstName',
      'lastName',
      'id',
    ];
    const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];
    return this.userRepository.findOne({
      where: params,
      select: options?.selectAll ? selectionsWithPassword : selections,
      relations: ['profile', 'presence', 'peer'],
    });
  }

  searchUsers(username: string) {
    const statement = '(user.username LIKE :username)';
    return this.userRepository
      .createQueryBuilder('user')
      .where(statement, { username: `%${username}%` })
      .limit(10)
      .select([
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.id',
        'user.profile',
      ])
      .getMany();
  }
}
