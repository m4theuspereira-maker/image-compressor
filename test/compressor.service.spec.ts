import { Test, TestingModule } from '@nestjs/testing';
import { CompressorService } from '../src/compressor/compressor.service';
import { CompressorRepository } from '../src/compressor/compressor.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { EXIF_METADATA_MOCK } from './common/mocks';
import ExifReader from 'exifreader';
import {
  IMAGE_DOWNLOADED_PATH,
} from '../src/config/environment-contants';
import * as fs from 'fs';

describe('CompressorService', () => {
  let compressorService: CompressorService;
  let compressorRepository: CompressorRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompressorService,
        {
          provide: CompressorRepository,
          useValue: { existsByUrl: () => true, saveImage: jest.fn() },
        },
      ],
    }).compile();

    compressorService = module.get<CompressorService>(CompressorService);
    compressorRepository =
      module.get<CompressorRepository>(CompressorRepository);
  });

  describe('downloadAndCompressImage', () => {
    it('should throw an iternalServerError if downloadImage reject', async () => {
      jest
        .spyOn(compressorService, 'downloadImage')
        .mockRejectedValueOnce(new Error());

      await expect(() =>
        compressorService.downloadAndCompressImage(
          'https://anyurl.com/any_image.jpg',
          60,
        ),
      ).rejects.toThrow(new InternalServerErrorException());
    });

    it(`
    should not call compress image if resolution was not 
    bigger than 720px and call copyFileWithLowResolution
    `, async () => {
      jest
        .spyOn(compressorService, 'downloadImage')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(compressorRepository, 'existsByUrl')
        .mockResolvedValueOnce(true as any);
      jest
        .spyOn(compressorService, 'getExifMetadata')
        .mockResolvedValueOnce(EXIF_METADATA_MOCK as any);
      jest
        .spyOn(compressorService, 'deletedOldImageIfItExists')
        .mockResolvedValueOnce();
      jest
        .spyOn(compressorService, 'hasImageMinimunResolutionToCompression')
        .mockReturnValueOnce(false);
      const copyImageSpy = jest
        .spyOn(compressorService, 'copyFileWithLowResolution')
        .mockResolvedValueOnce();

      const compressImageSpy = jest.spyOn(compressorService, 'compressImage');

      await compressorService.downloadAndCompressImage(
        'https://anyurl.com/any_image.jpg',
        60,
      );

      expect(compressImageSpy).not.toHaveBeenCalled();
      expect(copyImageSpy).toHaveBeenCalled();
    });

    it(`
    should call compress image if resolution was 
    bigger than 720px
    `, async () => {
      jest
        .spyOn(compressorService, 'hasImageMinimunResolutionToCompression')
        .mockReturnValueOnce(true);
      jest
        .spyOn(compressorService, 'downloadImage')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(compressorRepository, 'existsByUrl')
        .mockResolvedValueOnce(true as any);

      EXIF_METADATA_MOCK['Image Width'].description = '1080px';

      jest
        .spyOn(compressorService, 'getExifMetadata')
        .mockResolvedValueOnce(EXIF_METADATA_MOCK as any);
      jest
        .spyOn(compressorService, 'deletedOldImageIfItExists')
        .mockResolvedValueOnce();

      jest.spyOn(compressorService, 'compressImage').mockResolvedValueOnce();

      const copyImageSpy = jest
        .spyOn(compressorService, 'copyFileWithLowResolution')
        .mockResolvedValueOnce();

      const compressImageSpy = jest.spyOn(compressorService, 'compressImage');
      const makeObjectResultSpy = jest.spyOn(
        compressorService,
        'makeObjectResult',
      );
      await compressorService.downloadAndCompressImage(
        'https://anyurl.com/any_image.jpg',
        60,
      );

      expect(compressImageSpy).toHaveBeenCalled();
      expect(copyImageSpy).not.toHaveBeenCalled();
      expect(makeObjectResultSpy).toBeCalledTimes(1);
    });

    it('should return an object with exif metadata', async () => {
      jest
        .spyOn(compressorService, 'downloadImage')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(compressorRepository, 'existsByUrl')
        .mockResolvedValueOnce(true as any);
      jest
        .spyOn(compressorService, 'getExifMetadata')
        .mockResolvedValueOnce(EXIF_METADATA_MOCK as any);
      jest
        .spyOn(compressorService, 'deletedOldImageIfItExists')
        .mockResolvedValueOnce();
      jest
        .spyOn(compressorService, 'hasImageMinimunResolutionToCompression')
        .mockReturnValueOnce(false);
      jest
        .spyOn(compressorService, 'copyFileWithLowResolution')
        .mockResolvedValueOnce();

      jest.spyOn(compressorService, 'compressImage');

      const result = await compressorService.downloadAndCompressImage(
        'https://anyurl.com/any_image.jpg',
        60,
      );

      expect(result).toStrictEqual({
        localpath: {
          original: '/images/image.jpg',
          thumb: '/images/image_thumb.jpg',
        },
        metadata: { ...EXIF_METADATA_MOCK },
      });
    });
  });

  describe('getExifMetadata', () => {
    it('should call exifreader with ', async () => {
      const loadExifSpy = jest
        .spyOn(ExifReader, 'load')
        .mockResolvedValueOnce(EXIF_METADATA_MOCK as any);

      await compressorService.getExifMetadata();

      expect(loadExifSpy).toHaveBeenCalledWith(
        `./${IMAGE_DOWNLOADED_PATH}image.jpg`,
      );
    });
  });

  describe('hasImageMinimunResolutionToCompression', () => {
    it('should return true if resolution was bigger than 720px', () => {
      EXIF_METADATA_MOCK['Image Width'].description = '1080px';

      expect(
        compressorService.hasImageMinimunResolutionToCompression(
          EXIF_METADATA_MOCK,
        ),
      ).toBeTruthy();
    });

    it('should return false if resolution was shorter than 720px', () => {
      EXIF_METADATA_MOCK['Image Width'].description = '719px';

      expect(
        compressorService.hasImageMinimunResolutionToCompression(
          EXIF_METADATA_MOCK,
        ),
      ).toBeFalsy();
    });
  });

  describe('copyFileWithLowResolution', () => {
    it('should call unlink if folder has more than 1 file', async () => {
      jest
        .spyOn(fs.promises, 'readdir')
        .mockResolvedValueOnce(['file1', 'file2'] as any);

      const unlinkSpy = jest
        .spyOn(fs.promises, 'unlink')
        .mockResolvedValueOnce();
      jest.spyOn(fs.promises, 'copyFile').mockResolvedValueOnce();

      await compressorService.copyFileWithLowResolution();

      expect(unlinkSpy).toHaveBeenCalled();
    });

    it('should *NOT* call unlink if folder has 1 file or less', async () => {
      jest
        .spyOn(fs.promises, 'readdir')
        .mockResolvedValueOnce(['file1'] as any);

      const unlinkSpy = jest
        .spyOn(fs.promises, 'unlink')
        .mockResolvedValueOnce();

      jest.spyOn(compressorService, 'deletedOldImageIfItExists');

      jest.spyOn(fs.promises, 'copyFile').mockResolvedValueOnce();

      await compressorService.copyFileWithLowResolution();

      expect(unlinkSpy).not.toHaveBeenCalled();
    });
  });
});
