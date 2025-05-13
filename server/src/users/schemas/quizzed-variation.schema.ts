import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema()
export class QuizzedVariation extends Document {
  @Prop({type: Types.ObjectId, ref: 'Variation', required: true})
  variation: Types.ObjectId; // Reference to the Variation document


  @Prop({default: 0})
  numberOfAttempts: number;


  @Prop({default: [],
     type:  [{
    move: String,
    timestamp: {
      type: Date, 
      defualt: Date.now
    }
  }]})
  mistakes: {
    move: string;
    timestamp: Date;
  }[];
}


export const QuizzedVariationSchema = SchemaFactory.createForClass(QuizzedVariation);
export type QuizzedVariationDocument = QuizzedVariation & Document;
