import { Routes } from '@common/constants/constant';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller(Routes.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('check')
  async checkUserName(@Query('username') username: string) {
    if (!username) {
      throw new HttpException('Invalid Query', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findUser({ username });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    return HttpStatus.OK;
  }

  @Get('search')
  searchUsers(@Query('username') username: string) {
    if (!username) {
      throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);
    }

    return this.userService.searchUsers(username);
  }
}
