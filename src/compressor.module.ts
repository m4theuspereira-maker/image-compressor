import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompressorController } from './controllers/compressor.controller';
import { CompressorService } from './services/compressor.service';
import { ImagesMiddlewares } from './middlewares/image.middlewares';

@Module({
  imports: [],
  controllers: [CompressorController],
  providers: [CompressorService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ImagesMiddlewares).forRoutes('image');
  }
}
