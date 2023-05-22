import { Module } from '@nestjs/common';
import { CompressorModule } from './compressor/compressor.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_URL } from './config/environment-contants';

@Module({
  imports: [CompressorModule, MongooseModule.forRoot('mongodb://root:MongoDB2019!@localhost:27017/compress?retryWrites=true&w=majority&authSource=admin')],
  controllers: [],
  providers: [],
})
export class AppModule {}
