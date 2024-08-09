import { UserPresence } from '@common/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateStatusMessageParams } from '@shared/types';
import { Repository } from 'typeorm';
import { UserService } from './user.service';

@Injectable()
export class UserPresenceService {
  constructor(
    @InjectRepository(UserPresence)
    private readonly userPresenceRepository: Repository<UserPresence>,
    private readonly userService: UserService
  ) {}

  createPresence(): Promise<UserPresence> {
    return this.userPresenceRepository.save(
      this.userPresenceRepository.create()
    );
  }

  async updateStatus({ user, statusMessage }: UpdateStatusMessageParams) {
    if (!user.presence) {
      user.presence = await this.createPresence();
    }

    user.presence.statusMessage = statusMessage;
    return this.userService.saveUser(user);
  }
}
