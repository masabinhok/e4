import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OpeningsService } from './openings.service';
import { AddOpeningDto } from './dtos/add-opening.dto';
import { MongooseId } from 'src/types/types';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@UseGuards(AuthGuard)
@Controller('openings')
export class OpeningsController {
  constructor(private readonly openingsService: OpeningsService) {}

  @Get('')
  async findAll() {
    return this.openingsService.findAll();
  }

  @Get('pending')
  async findPending(@GetUser('sub') userId: MongooseId) {
    return this.openingsService.findPending(userId);
  }

  @Post('add')
  async addOpening(@Body() addOpeningDto: AddOpeningDto, @GetUser('sub') userId: MongooseId) {
    return this.openingsService.addOpening(addOpeningDto, userId);
  }

  @Get(':code')
  async getOpening(@Param('code') code: string) {
    return this.openingsService.getOpening(code);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Post('accept/:id')
  async acceptOpening(@Param('id') openingId: MongooseId){
    return this.openingsService.acceptOpening(openingId);
  }

}
