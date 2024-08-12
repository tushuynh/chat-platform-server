import { Routes } from '@common/constants/constant';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GroupMessageService } from '../services/groupMessage.service';
import { SkipThrottle } from '@nestjs/throttler';

@Controller(Routes.GROUPS_MESSAGES)
export class GroupMessageController {
  constructor(private readonly groupMessageService: GroupMessageService) {}

  @SkipThrottle()
  @Get()
  async getGroupMessages(@Param('id', ParseIntPipe) id: number) {
    const messages = await this.groupMessageService.getGroupMessages(id);
    return { id, messages };
  }
}
