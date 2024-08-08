import { HttpException, HttpStatus } from '@nestjs/common';

export class CannotCreateMessageException extends HttpException {
  constructor() {
    super('Cannot create message', HttpStatus.BAD_REQUEST);
  }
}
