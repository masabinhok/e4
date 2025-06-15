import { Injectable } from '@nestjs/common';
import { Variation, VariationDocument } from './schema/variation.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OpeningsService } from 'src/openings/openings.service';

@Injectable()
export class VariationsService {
  constructor(
    @InjectModel(Variation.name)
    private variationModel: Model<VariationDocument>,
    private openingsService: OpeningsService,
  ) {}
}
