import {
  Body,
  Controller,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserProfileService } from '../services/userProfile.service';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { User } from '@common/database/entities';
import { UpdateUserProfileParams, UserProfileFiles } from '@shared/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Routes, UserProfileFileFields } from '@common/constants/constant';
import { UpdateUserProfileDto } from '../dtos/updateUserProfile.dto';

@Controller(Routes.USERS_PROFILES)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @UseInterceptors(FileFieldsInterceptor(UserProfileFileFields))
  @Patch()
  async updateUserProfile(
    @AuthUser() user: User,
    @UploadedFiles()
    files: UserProfileFiles,
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ) {
    const params: UpdateUserProfileParams = {};
    updateUserProfileDto.about && (params.about = updateUserProfileDto.about);
    files.banner && (params.banner = files.banner[0]);
    files.avatar && (params.avatar = files.avatar[0]);

    return this.userProfileService.createProfileOrUpdate(user, params);
  }
}
