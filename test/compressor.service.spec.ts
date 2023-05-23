import { Test, TestingModule } from '@nestjs/testing';
import { CompressorService } from '../src/compressor/compressor.service';
import { CompressorRepository } from '../src/compressor/compressor.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { EXIF_METADATA_MOCK } from './mocks';

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

  


});
