import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as compressImages from 'compress-images';
import * as fs from 'fs';
import * as client from 'https';
import {
  IMAGE_COMPRESSED_NAME,
  IMAGE_DOWNLAODED_NAME,
  IMAGE_DOWNLOADED_PATH,
} from './config/environment-contants';
import { ICompressionStatistics } from './interfaces/interfaces';
import ExifReader from 'exifreader';
import axios from 'axios';
import { resolve } from 'node:path';
import { cwd } from 'process';
import { CompressorRepository } from './compressor.repository';

@Injectable()
export class CompressorService {
  constructor(private compressorRepository: CompressorRepository) {}

  async downloadAndCompressImage(url: string, compression: number) {
    try {
      const filepath = `${IMAGE_DOWNLOADED_PATH}${IMAGE_DOWNLAODED_NAME}`;

      const compressionRounded = Math.round(compression);

      await this.deletedOldImageIfItExists();

      const downloaded = await this.downloadImage(url);
      if (downloaded) {
        const exif = await this.getExifMetadata();

        if (!(await this.compressorRepository.existsByUrl(url))) {
          await this.compressorRepository.saveImage({ url, exif });
        }

        if (!this.hasImageMinimunResolutionToCompression(exif)) {
          await this.copyFileWithLowResolution();
          return this.makeObjectResult(exif);
        }

        await this.compressImage(filepath, compressionRounded);
        return this.makeObjectResult(exif);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async downloadImage(url: string) {
    const path = resolve(cwd(), 'images', IMAGE_DOWNLAODED_NAME);
    const writer = fs.createWriteStream(path);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => reject(err));
    });
  }

  async compressImage(filepath: string, compression: number) {
    try {
      const compressedFilePath = `${IMAGE_DOWNLOADED_PATH}/${IMAGE_COMPRESSED_NAME}_`;
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
        async (
          error: any,
          completed: boolean,
          statistic: ICompressionStatistics,
        ) => {
          await fs.promises.rename(
            `${compressedFilePath}image.jpg`,
            `${IMAGE_DOWNLOADED_PATH}image_${IMAGE_COMPRESSED_NAME}.jpg`,
          );

          console.log('-------------');
          console.log(error);
          console.log(completed);
          console.log(statistic);
          console.log('-------------');
        },
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getExifMetadata() {
    return ExifReader.load(`./${IMAGE_DOWNLOADED_PATH}image.jpg`);
  }

  hasImageMinimunResolutionToCompression(exif: any) {
    const heigth = Number(
      exif['Image Height'].description.replace(/[^0-9\.]+/g, ''),
    );
    const width = Number(
      exif['Image Width'].description.replace(/[^0-9\.]+/g, ''),
    );

    const biggerResolution = heigth > width ? heigth : width;

    return biggerResolution > 720;
  }

  async copyFileWithLowResolution() {
    if ((await fs.promises.readdir(`./${IMAGE_DOWNLOADED_PATH}/`)).length > 1) {
      await fs.promises.unlink(
        `${IMAGE_DOWNLOADED_PATH}image_${IMAGE_COMPRESSED_NAME}.jpg`,
      );
    }

    fs.readdir(`./${IMAGE_DOWNLOADED_PATH}/`, async () => {
      await fs.promises.copyFile(
        `./${IMAGE_DOWNLOADED_PATH}image.jpg`,
        `${IMAGE_DOWNLOADED_PATH}image_${IMAGE_COMPRESSED_NAME}.jpg`,
      );
    });
  }

  async deletedOldImageIfItExists() {
    if ((await fs.promises.readdir(`./${IMAGE_DOWNLOADED_PATH}/`)).length > 1) {
      await fs.promises.unlink(`${IMAGE_DOWNLOADED_PATH}image.jpg`);
    }
  }

  makeObjectResult = (exif: any) => ({
    localpath: {
      original: '/images/image.jpg',
      thumb: '/images/image_thumb.jpg',
    },
    metadata: { ...exif },
  });
}
