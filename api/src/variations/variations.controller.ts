import { Body, Controller, Post } from '@nestjs/common';
import { VariationsService } from './variations.service';

@Controller('variations')
export class VariationsController {
  constructor(private readonly variationsService: VariationsService) {}
}
