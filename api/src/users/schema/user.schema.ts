import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Variation } from 'src/variations/schema/variation.schema';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  passHash: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }])
  recordedLines?: Variation[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }])
  contributedLines?: Variation[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }])
  customLines?: Variation[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }])
  practicedLines?: Variation[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }])
  quizzedLines?: Variation[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }])
  learnedLines?: Variation[];
}

export const UserSchema = SchemaFactory.createForClass(User);
