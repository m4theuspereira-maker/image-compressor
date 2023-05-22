import { Injectable } from '@nestjs/common';
import { Image, ImageDocument } from './models/compressor.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ISaveImage } from './interfaces/interfaces';

@Injectable()
export class CompressorRepository {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async saveImage(image: ISaveImage) {
    return (await this.imageModel.create(image)).save();
  }

  async existsByUrl(url: string): Promise<ImageDocument> {
    return this.imageModel.findOne({ url });
  }
}
