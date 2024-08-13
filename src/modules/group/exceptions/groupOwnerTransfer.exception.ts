import { HttpException, HttpStatus } from '@nestjs/common';

export class GroupOwnerTransferException extends HttpException {
  constructor(message?: string) {
    const defaultMessage = 'Group owner transfer exception';
    const errorMessage = message
      ? defaultMessage.concat(': ', message)
      : defaultMessage;
    super(errorMessage, HttpStatus.BAD_REQUEST);
  }
}
