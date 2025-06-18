import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Variation } from 'src/variations/schema/variation.schema';

@Schema()
export class Opening {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Variation', default: [] })
  variations: Variation[];
}

export type OpeningDocument = Opening & Document;
export const OpeningSchema = SchemaFactory.createForClass(Opening);
