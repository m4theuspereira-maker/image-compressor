import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CompressorService } from './compressor.service.js';
import { ok, serverError, unaceptedUrl } from './errors/errors.js';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CompressorImageDto } from './dto/compress-image.dto.js';

@Controller()
export class CompressorController {
  constructor(private readonly appService: CompressorService) {}

  @Post('/image/save')
  @ApiTags('Compress')
  async compressImage(
    @Res() res: Response,
    @Body() compressImageDto: CompressorImageDto,
  ) {
    try {
      const { url, compress } = compressImageDto;

      const result = await this.appService.downloadAndCompressImage(
        url,
        compress,
      );

      return ok(res, result);
    } catch (error) {
      return serverError(res);
    }
  }
}
