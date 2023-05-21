import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { unaceptedUrl } from '../errors/errors';

export class ImagesMiddlewares implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { url } = req.body as any;

    if (url.startsWith('http://')) {
      return unaceptedUrl(res);
    }

    next();
  }
}
