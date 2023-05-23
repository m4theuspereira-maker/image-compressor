import { Module } from '@nestjs/common';
import { CompressorModule } from './compressor/compressor.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_URL } from './config/environment-contants';
import { CompressorService } from './compressor/compressor.service';

@Module({
  imports: [CompressorModule, MongooseModule.forRoot(DATABASE_URL)],
  controllers: [],
  providers: [],
})
export class AppModule {}
