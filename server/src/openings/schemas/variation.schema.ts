// variation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BoardFlip {
  White = 'white',
  Black = 'black',
}

@Schema()
export class Variation extends Document {

  @Prop({ required: true })
  title: string;  // Title of the variation, e.g., "Caro-Kann: Advance Variation"

  @Prop({ type: [String] })
  moves: string[];  // A list of moves, e.g., ["e4", "c6", "d4", "d5", "e5"]

  @Prop()
  description: string;  // Optional description of the variation

  @Prop({enum: BoardFlip, default: BoardFlip.White, type: String})
  boardflip: BoardFlip;  
}

export const VariationSchema = SchemaFactory.createForClass(Variation);
export type VariationDocument = Variation & Document;
