import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CompressorService } from '../services/compressor.service.js';
import { ok, serverError, unaceptedUrl } from '../errors/errors.js';
import { Response } from 'express';

@Controller()
export class CompressorController {
  constructor(private readonly appService: CompressorService) {}

  @Post('/image')
  async compressImage(@Req() req: Request, @Res() res: Response) {
    try {
      const { url, compression } = req.body as any;

      const result = await this.appService.downloadAndCompressImage(
        url,
        compression,
      );

      return ok(res, result);
    } catch (error) {
      return serverError(res);
    }
  }
}
