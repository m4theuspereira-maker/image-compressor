import { Module } from '@nestjs/common';
import { CompressorModule } from './compressor/compressor.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    CompressorModule,
    MongooseModule.forRoot(
      'mongodb://localhost:27017/compress?retryWrites=true&w=majority&authSource=admin',
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
