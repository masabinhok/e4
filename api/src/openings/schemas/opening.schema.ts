import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Variation } from 'src/variations/schema/variation.schema';

export enum Status {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED'
}

@Schema({timestamps : true})
export class Opening {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({required: true, type: String, default:Status.Pending, enum: Status })
  status: Status;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  contributor?: User

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Variation',
    default: [],
  })
  variations: Variation[];
}

export type OpeningDocument = Opening & Document;
export const OpeningSchema = SchemaFactory.createForClass(Opening);
