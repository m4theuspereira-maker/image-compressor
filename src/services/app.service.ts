import { Injectable } from '@nestjs/common';
import * as compressImages from 'compress-images';
import * as fs from 'fs';
import * as client from 'https';
import {
  IMAGE_DOWNLAODED_NAME,
  IMAGE_DOWNLOADED_PATH,
} from '../config/environment-contants';

@Injectable()
export class AppService {
  async downloadAndCompressImage(url: string, compression: number) {
    if (url.startsWith('http://')) {
      return false;
    }

    const filepath = `${IMAGE_DOWNLOADED_PATH}/${IMAGE_DOWNLAODED_NAME}`;

    const compressionRounded = Math.round(compression);

    this.downloadImage(url, filepath);

    await this.compressImage(filepath, compressionRounded);
  }

  async downloadImage(url: string, filepath: string) {
    try {
      return new Promise((resolve, reject) => {
        client.get(url, (res) => {
          if (res.statusCode === 200) {
            res
              .pipe(fs.createWriteStream(filepath))
              .on('error', reject)
              .once('close', () => resolve(filepath));
          } else {
            // Consume response data to free up memory
            res.resume();
            reject(
              new Error(`Request Failed With a Status Code: ${res.statusCode}`),
            );
          }
        });
      });
    } catch (error) {
      throw new Error('Server Error');
    }
  }

  async compressImage(filepath: string, compression: number) {
    try {
      const compressedFilePath =
        'images/' + new Date().getTime() + '-' + 'misera.png';

      const a = await compressImages(
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
        async (
          error: any,
          completed: boolean,
          statistic: {
            input: string;
            path_out_new: string;
            algorithm: string;
            size_in: number;
            size_output: number;
            percent: number;
            err: any;
          },
        ) => {
          console.log('-------------');
          console.log(error);
          console.log(completed);
          console.log(statistic);
          console.log('-------------');
        },
      );
    } catch (error) {
      throw new Error('peste');
    }
  }
}
