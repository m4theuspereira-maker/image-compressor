import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ImageDocument = HydratedDocument<Image>;

@Schema()
export class Image {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true, type: Object })
  exif: any;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
