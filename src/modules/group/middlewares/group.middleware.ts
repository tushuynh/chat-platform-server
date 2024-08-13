import { Injectable, NestMiddleware } from '@nestjs/common';
import { GroupService } from '../services/group.service';
import { AuthenticatedRequest } from '@shared/types';
import { NextFunction, Response } from 'express';
import { InvalidGroupIdException } from '../exceptions/invalidGroupId.exception';
import { GroupNotFoundException } from '../exceptions/groupNotFound.exception';

@Injectable()
export class GroupMiddleware implements NestMiddleware {
  constructor(private readonly groupService: GroupService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id: userId } = req.user;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new InvalidGroupIdException();
    }

    const params = { id, userId };
    const user = await this.groupService.hasAccess(params);
    if (!user) {
      throw new GroupNotFoundException();
    }

    next();
  }
}
