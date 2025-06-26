import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Status } from 'src/openings/schemas/opening.schema';
import { User } from 'src/users/schema/user.schema';

export type BoardFlip = 'white' | 'black';

@Schema({timestamps: true})
export class Variation {
  @Prop({ required: true })
  title: string;

  @Prop({required: true, type: String, default:Status.Pending, enum: Status })
  status: Status;
  
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  contributor?: User;

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
