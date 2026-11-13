import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chess } from 'chess.js';
import { Opening, Status } from 'src/openings/schemas/opening.schema';
import { Variation } from 'src/variations/schema/variation.schema';
import { CoachReply } from './coach.schema';
import { buildPrompt } from './prompt';

export type CoachAnswer = { text: string; source: 'ai' | 'cache' | 'note' };

// OpenAI-compatible chat API. Defaults to Groq's free tier for open-weight models;
// changing these env vars swaps the provider.
const DEFAULT_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(
    @InjectModel(Variation.name) private variationModel: Model<Variation>,
    @InjectModel(Opening.name) private openingModel: Model<Opening>,
    @InjectModel(CoachReply.name) private replyModel: Model<CoachReply>,
  ) {}

  async ask(
    variationId: string,
    index: number,
    played?: string,
  ): Promise<CoachAnswer> {
    const line = await this.variationModel.findOne({
      _id: variationId,
      status: Status.Accepted,
    });
    if (!line?.notes?.length)
      throw new NotFoundException('The coach only talks about course lines');
    if (index >= line.moves.length)
      throw new BadRequestException('No such move in this line');
    const opening = await this.openingModel.findOne({ code: line.code });
    if (!opening) throw new NotFoundException('No such course');

    if (played) {
      const chess = new Chess();
      line.moves.slice(0, index).forEach((m) => chess.move(m));
      try {
        played = chess.move(played).san;
      } catch {
        throw new BadRequestException(`${played} isn't a legal move there`);
      }
      if (played === line.moves[index]) played = undefined; // that's the right move
    }

    const note = line.notes[index] ?? '';
    const key = `${variationId}:${index}:${played ?? ''}`;
    const cached = await this.replyModel.findOne({ key });
    if (cached) return { text: cached.text, source: 'cache' };

    const fallback: CoachAnswer = {
      text: note || `This line plays ${line.moves[index]}.`,
      source: 'note',
    };
    const apiKey = process.env.COACH_API_KEY;
    if (!apiKey || (await this.overDailyLimit())) return fallback;

    try {
      const res = await fetch(
        `${process.env.COACH_API_URL || DEFAULT_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.COACH_MODEL || DEFAULT_MODEL,
            messages: buildPrompt({
              openingName: opening.name,
              side: opening.side ?? line.boardflip ?? 'white',
              lineTitle: line.title,
              moves: line.moves,
              index,
              note,
              played,
            }),
            max_tokens: 120,
            temperature: 0.8,
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!res.ok) throw new Error(`provider answered ${res.status}`);
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim().slice(0, 400);
      if (!text) throw new Error('empty reply');
      await this.replyModel.updateOne(
        { key },
        { $setOnInsert: { key, text } },
        { upsert: true },
      );
      return { text, source: 'ai' };
    } catch (err) {
      this.logger.warn(
        `coach fell back to the note: ${err instanceof Error ? err.message : err}`,
      );
      return fallback;
    }
  }

  // Each cached reply is one model call, so today's count is the number made today.
  private async overDailyLimit() {
    const limit = Number(process.env.COACH_DAILY_LIMIT ?? 500);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return (
      (await this.replyModel.countDocuments({ createdAt: { $gte: today } })) >=
      limit
    );
  }
}
