import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ImageDocument = HydratedDocument<{}>;

@Schema()
export class Image {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true, default: new Date() })
  createdAt: Date;
}
