import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { QuizzedVariation, QuizzedVariationSchema } from "./quizzed-variation.schema";

@Schema({timestamps: true}) 
export class User extends Document {

  @Prop({required: true, unique: true})
  username: string;

  @Prop({required: true, unique: true})
  email: string;

  @Prop({required: true})
  password: string; 

  @Prop()
  profilePicture?: string;

  @Prop({
    type: Types.ObjectId, ref: 'Variation',default: []
  }, )
  savedLines?: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId, ref: 'Variation', default: []
  })
  recordedLines?: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId, ref: 'Variation', default: []
  })
  contributedLines?: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId, ref: 'Variation', default: []
  })
  learnedVariations?: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId, ref: 'Variation', default: []
  })
  practicedVariations?: Types.ObjectId[];

  @Prop({
    default: [], 
    type: [QuizzedVariationSchema]
  })
  quizzedVariations?: QuizzedVariation[] // Array of quized variation IDs
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;