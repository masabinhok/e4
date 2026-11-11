import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Role } from 'src/roles/roles.enum';
import { Variation } from 'src/variations/schema/variation.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passHash: string;

  @Prop({ type: String, enum: Role, default: Role.User })
  role: Role;

  @Prop()
  refreshToken?: string;

  @Prop({ default: false })
  isDemo: boolean;

  // TTL index: Mongo deletes demo users once this passes (unset for real users).
  @Prop({ type: Date, expires: 0 })
  expiresAt?: Date;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }],
    default: [],
  })
  recordedLines?: Variation[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }],
    default: [],
  })
  contributedLines?: Variation[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }],
    default: [],
  })
  customLines?: Variation[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }],
    default: [],
  })
  practicedLines?: Variation[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }],
    default: [],
  })
  quizzedLines?: Variation[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variation' }],
    default: [],
  })
  learnedLines?: Variation[];
}

export const UserSchema = SchemaFactory.createForClass(User);
