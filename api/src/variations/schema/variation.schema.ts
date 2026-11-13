import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Status } from 'src/openings/schemas/opening.schema';
import { User } from 'src/users/schema/user.schema';

export type BoardFlip = 'white' | 'black';

@Schema({ timestamps: true })
export class Variation {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: String, default: Status.Pending, enum: Status })
  status: Status;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  contributor?: User;

  @Prop({ required: true })
  moves: string[];

  @Prop({ default: 'white' })
  boardflip: BoardFlip;

  // Optional in the forms, so an empty string is valid.
  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  code: string;

  // Course lines only (seeded from api/src/seed/courses).
  @Prop()
  chapter?: string;

  @Prop()
  order?: number;

  @Prop()
  officialName?: string; // the Lichess opening name for this line

  @Prop({ type: [String], default: undefined })
  notes?: string[]; // notes[i] explains moves[i]
}

export type VariationDocument = Variation & Document;
export const VariationSchema = SchemaFactory.createForClass(Variation);
