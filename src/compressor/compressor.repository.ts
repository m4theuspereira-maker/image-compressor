import { Injectable } from '@nestjs/common';
import { Image, ImageDocument } from './models/compressor.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CompressorRepository {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async saveImage(image: { url: string; exif: any }) {
    return (await this.imageModel.create(image)).save();
  }
}
