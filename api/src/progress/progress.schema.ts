import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variation',
    required: true,
  })
  variation: mongoose.Types.ObjectId;

  @Prop({ default: 0 })
  box: number;

  @Prop({ required: true })
  dueAt: Date;

  @Prop({ default: 0 })
  reviews: number;

  @Prop({ default: 0 })
  lastMistakes: number;

  // Demo accounts only: deleted together with the account (TTL index).
  @Prop({ type: Date, expires: 0 })
  expiresAt?: Date;
}

export type ProgressDocument = Progress & Document;
export const ProgressSchema = SchemaFactory.createForClass(Progress);
ProgressSchema.index({ user: 1, variation: 1 }, { unique: true });
