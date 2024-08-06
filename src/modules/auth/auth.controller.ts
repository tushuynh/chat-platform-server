import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { Routes } from '@common/constants/constant';
import { UserService } from '@modules/user/services/user.service';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findUser({
      username: createUserDto.username,
    });
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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Res() res: Response) {
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('status')
  async status(@Req() req: Request, @Res() res: Response) {
    res.send(req.user);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logOut((error) => {
      return error
        ? res.sendStatus(HttpStatus.BAD_REQUEST)
        : res.sendStatus(HttpStatus.OK);
    });
  }
}
