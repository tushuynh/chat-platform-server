import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendNotFoundException extends HttpException {
  constructor() {
    super('Friend not found', HttpStatus.NOT_FOUND);
  }
}
