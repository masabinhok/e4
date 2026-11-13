import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// One cached reply per (line, move, wrong move). Shared by every learner, so the
// model is called once per situation, not once per click.
@Schema({ timestamps: true })
export class CoachReply {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  text: string;
}

export const CoachReplySchema = SchemaFactory.createForClass(CoachReply);
