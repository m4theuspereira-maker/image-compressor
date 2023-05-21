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

  constructor(CompressorRepository: CompressorRepository){}


  async downloadAndCompressImage(url: string, compression: number) {
    try {
      let exif;
      let result;

      const filepath = `${IMAGE_DOWNLOADED_PATH}${IMAGE_DOWNLAODED_NAME}`;

      const compressionRounded = Math.round(compression);

      if (
        (await fs.promises.readdir(`./${IMAGE_DOWNLOADED_PATH}/`)).length > 1
      ) {
        fs.unlink(`./${IMAGE_DOWNLOADED_PATH}image.jpg`, () => {
          console.log('deleting old file...');
        });
      }

      const downloaded = await this.downloadImage(url);

      if (downloaded) {
        exif = await this.getExifMetadata();
      }

      if (this.hasImageMinimunResolutionToCompression(exif)) {
        result = await this.compressImage(filepath, compressionRounded);
      }

      result = await this.copyFileWithLowResolution();

      return result;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async downloadImage(url: string) {
    const path = resolve(cwd(), 'images', 'image.jpg');
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
      let completedStatus: boolean = false;
      let statisticObject: any = {};

      if (
        (await fs.promises.readdir(`./${IMAGE_DOWNLOADED_PATH}/`)).length > 1
      ) {
        fs.unlink(
          `${IMAGE_DOWNLOADED_PATH}image_${IMAGE_COMPRESSED_NAME}.jpg`,
          () => {
            console.log('deleting old file...');
          },
        );
      }

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
            `${compressedFilePath}image.jpg`,
            `${IMAGE_DOWNLOADED_PATH}image_${IMAGE_COMPRESSED_NAME}.jpg`,
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
          original: '/images/original.jpg',
          thumb: '/images/image_thumb.jpg',
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

  async getExifMetadata() {
    const exif = await ExifReader.load(`./${IMAGE_DOWNLOADED_PATH}image.jpg`);

    return exif;
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
    fs.readdir(`./${IMAGE_DOWNLOADED_PATH}/`, async () => {
      fs.copyFile(
        `./${IMAGE_DOWNLOADED_PATH}image.jpg`,
        `${IMAGE_DOWNLOADED_PATH}image_${IMAGE_COMPRESSED_NAME}.jpg`,
        () => {
          console.log('copyed with success');
        },
      );
    });

    return 'aaaaaaaaa';
  }
}
