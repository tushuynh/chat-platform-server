import { HttpException, HttpStatus } from '@nestjs/common';

export class DeleteFriendException extends HttpException {
  constructor() {
    super('Cannot delete friend', HttpStatus.BAD_REQUEST);
  }
}
