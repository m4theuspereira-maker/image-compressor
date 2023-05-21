import { Module } from '@nestjs/common';
import { CompressorController } from './controllers/compressor.controller';
import { CompressorService } from './services/compressor.service';

@Module({
  imports: [],
  controllers: [CompressorController],
  providers: [CompressorService],
})
export class AppModule {}
