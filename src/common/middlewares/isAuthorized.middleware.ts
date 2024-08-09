import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthenticatedRequest } from '@shared/types';
import { NextFunction, Response } from 'express';

export function isAuthorized(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
  }

  next();
}
