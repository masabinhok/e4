import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

import { MongooseId } from 'src/types/types';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':recorded-lines')
  async getRecordedPgns(@GetUser('sub') userId: MongooseId) {
    return this.usersService.getRecordedPgns(userId);
  }

  @Get(':custom-pgns')
  async getCustomPgns(@GetUser('sub') userId: MongooseId) {
    return this.usersService.getCustomPgns(userId);
  }
}
