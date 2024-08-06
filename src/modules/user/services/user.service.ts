import { CreateUserDto } from '@modules/auth/dtos/CreateUser.dto';
import { Peer, User } from '@modules/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async findByUserName(username: string) {
    return this.userRepository.findOneBy({ username });
  }
}
