import { HttpException, HttpStatus } from '@nestjs/common';

export class NotGroupOwnerException extends HttpException {
  constructor() {
    super('Not a group owner', HttpStatus.BAD_REQUEST);
  }
}
