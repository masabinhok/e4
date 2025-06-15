import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BoardFlip = 'white' | 'black';

@Schema()
export class Variation {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  moves: string[];

  @Prop({ default: 'white' })
  boardflip: BoardFlip;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  code: string;
}

export type VariationDocument = Variation & Document;
export const VariationSchema = SchemaFactory.createForClass(Variation);
