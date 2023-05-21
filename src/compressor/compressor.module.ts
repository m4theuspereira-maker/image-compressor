import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompressorController } from './compressor.controller';
import { CompressorService } from './compressor.service';
import { ImagesMiddlewares } from './middlewares/image.middlewares';
import { MongooseModule } from '@nestjs/mongoose';
import { CompressorRepository } from './compressor.repository';
import { Image, ImageSchema } from './models/compressor.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  controllers: [CompressorController],
  providers: [CompressorService, CompressorRepository],
})
export class CompressorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ImagesMiddlewares).forRoutes('image/save');
  }
}
