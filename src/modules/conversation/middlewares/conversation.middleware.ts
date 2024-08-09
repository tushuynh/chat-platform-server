import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { AuthenticatedRequest } from '@shared/types';
import { InvalidConversationIdException } from '../exceptions/invalidConversationId.exception';
import { ConversationNotFoundException } from '../exceptions/conversationNotFound.exception';

@Injectable()
export class ConversationMiddleware implements NestMiddleware {
  constructor(private readonly conversationService: ConversationService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id: userId } = req.user;
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      throw new InvalidConversationIdException();
    }

    const isReadable = await this.conversationService.hasAccess({
      id: conversationId,
      userId,
    });
    if (!isReadable) {
      throw new ConversationNotFoundException();
    }

    next();
  }
}
