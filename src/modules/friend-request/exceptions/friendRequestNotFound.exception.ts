import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestNotFound extends HttpException {
  constructor() {
    super('Friend request not found', HttpStatus.BAD_REQUEST);
  }
}
