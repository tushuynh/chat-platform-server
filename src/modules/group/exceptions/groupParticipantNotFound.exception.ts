import { HttpException, HttpStatus } from '@nestjs/common';

export class GroupParticipantNotFoundException extends HttpException {
  constructor() {
    super('Group participant not found', HttpStatus.NOT_FOUND);
  }
}
