import { Routes } from '@common/constants/constant';
import { User } from '@common/database/entities';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { AuthenticatedGuard } from '@modules/auth/guards/authenticated.guard';
import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UpdatePresenceStatusDto } from '../dtos/updatePresenceStatus.dto';
import { UserPresenceService } from '../services/userPresence.service';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.USERS_PRESENCE)
export class UserPresenceController {
  constructor(private readonly userPresenceService: UserPresenceService) {}

  @Patch('status')
  updateStatus(
    @AuthUser() user: User,
    @Body() { statusMessage }: UpdatePresenceStatusDto
  ) {
    return this.userPresenceService.updateStatus({ user, statusMessage });
  }
}
