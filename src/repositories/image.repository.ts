import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Image, ImageDocument } from './schemas/image.schema';
import { Model } from 'mongoose';

export class ImageRepository {
  constructor(private imageModel: Model<ImageDocument>) {}

  async saveImage(image: { url: string; exif: any }) {
    return (await this.imageModel.create(image)).save();
  }
}
