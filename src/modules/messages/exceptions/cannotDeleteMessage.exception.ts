import { HttpException, HttpStatus } from '@nestjs/common';

export class CannotDeleteMessageException extends HttpException {
  constructor() {
    super('Cannot delete message', HttpStatus.BAD_REQUEST);
  }
}
