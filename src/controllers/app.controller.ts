import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from '../services/app.service.js';
import { serverError, unaceptedUrl } from '../errors/errors';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/image')
  async compressImage(@Req() req: Request, @Res() res: Response) {
    try {
      const { url, compression } = req.body as any;

      const result = await this.appService.downloadAndCompressImage(
        url,
        compression,
      );

      if (!result) {
        return unaceptedUrl(res);
      }
    } catch (error) {
      return serverError(res);
    }
  }
}
