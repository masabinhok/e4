// opening.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Variation } from './variation.schema';  // import Variation model

@Schema()
export class Opening extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [Variation], default: [] })  // Variations are now embedded as an array
  variations: Variation[];
}

export const OpeningSchema = SchemaFactory.createForClass(Opening);
export type OpeningDocument = Opening & Document;
