import { Profile, User } from '@common/database/entities';
import { ImageStorageService } from '@modules/imageStorage/services/imageStorage.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateUUIDV4 } from '@shared/generation';
import { UpdateUserProfileParams } from '@shared/types';
import { Repository } from 'typeorm';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly imageStorageService: ImageStorageService
  ) {}

  async createProfileOrUpdate(user: User, params: UpdateUserProfileParams) {
    if (!user.profile) {
      user.profile = await this.createProfile();
    }

    return this.updateProfile(user, params);
  }

  createProfile() {
    const newProfile = this.profileRepository.create();
    return this.profileRepository.save(newProfile);
  }

  async updateProfile(user: User, params: UpdateUserProfileParams) {
    if (params.avatar) {
      user.profile.avatar = await this.updateAvatar(params.avatar);
    }
    if (params.banner) {
      user.profile.banner = await this.updateBanner(params.banner);
    }
    if (params.about) {
      user.profile.about = params.about;
    }

    return this.userRepository.save(user);
  }

  async updateAvatar(file: Express.Multer.File) {
    const key = generateUUIDV4();
    await this.imageStorageService.upload({ key, file });
    return key;
  }

  async updateBanner(file: Express.Multer.File) {
    const key = generateUUIDV4();
    await this.imageStorageService.upload({ key, file });
    return key;
  }
}
