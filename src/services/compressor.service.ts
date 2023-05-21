import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as compressImages from 'compress-images';
import * as fs from 'fs';
import * as client from 'https';
import {
  IMAGE_COMPRESSED_NAME,
  IMAGE_DOWNLAODED_NAME,
  IMAGE_DOWNLOADED_PATH,
} from '../config/environment-contants';
import { ICompressionStatistics } from './interfaces';
import ExifReader from 'exifreader';

@Injectable()
export class CompressorService {
  async downloadAndCompressImage(url: string, compression: number) {
    try {
      const filepath = `${IMAGE_DOWNLOADED_PATH}/${IMAGE_DOWNLAODED_NAME}`;

      const compressionRounded = Math.round(compression);

      await this.downloadImage(url, filepath);

      const result = await this.compressImage(filepath, compressionRounded);

      return result;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async downloadImage(url: string, filepath: string) {
    try {
      new Promise((resolve, reject) => {
        client.get(url, (res) => {
          if (res.statusCode === 200) {
            res
              .pipe(fs.createWriteStream(filepath))
              .on('error', reject)
              .once('close', () => resolve(filepath));
          } else {
            res.resume();
            reject(
              new Error(`Request Failed With a Status Code: ${res.statusCode}`),
            );
          }
        });
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async compressImage(filepath: string, compression: number) {
    try {
      const compressedFilePath = `${IMAGE_DOWNLOADED_PATH}/${IMAGE_COMPRESSED_NAME}_`;
      let completedStatus: boolean = false;
      let statisticObject: any = {};

      await compressImages(
        filepath,
        compressedFilePath,
        { compress_force: false, statistic: true, autoupdate: true },
        false,
        { jpg: { engine: 'mozjpeg', command: ['-quality', compression] } },
        {
          png: {
            engine: 'pngquant',
            command: ['--quality=' + compression + '-' + compression, '-o'],
          },
        },
        { svg: { engine: 'svgo', command: '--multipass' } },
        {
          gif: {
            engine: 'gifsicle',
            command: ['--colors', '64', '--use-col=web'],
          },
        },
        (error: any, completed: boolean, statistic: ICompressionStatistics) => {
          statisticObject = statistic;
          completedStatus = completed;

          fs.rename(
            `${compressedFilePath}image.png`,
            `${IMAGE_DOWNLOADED_PATH}/image_${IMAGE_COMPRESSED_NAME}.png`,
            () => {
              console.log('file renamed');
            },
          );

          console.log('-------------');
          console.log(error);
          console.log(completed);
          console.log(statistic);
          console.log('-------------');
        },
      );

      return {
        localpath: {
          original: '/images/original.png',
          thumb: '/images/image_thumb.png',
        },
        metadata: {
          data: {
            completedStatus,
            statistic: { ...statisticObject },
          },
        },
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
