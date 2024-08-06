import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { Routes } from '@common/constants/constant';
import { UserService } from '@modules/user/services/user.service';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { instanceToPlain } from 'class-transformer';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByUserName(
      createUserDto.username
    );
    if (existingUser) {
      throw new HttpException('User already exist', HttpStatus.CONFLICT);
    }

    const hashedPassword = await this.authService.hashPassword(
      createUserDto.password
    );
    const user = await this.userService.createUser(
      createUserDto,
      hashedPassword
    );

    return instanceToPlain(user);
  }
}
