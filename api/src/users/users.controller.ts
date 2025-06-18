import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { GetUserId } from 'src/common/decorators/get-user.decorator';
import { MongooseId } from 'src/types/types';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':recorded-lines')
  async getRecordedPgns(@GetUserId() userId: MongooseId){
    return this.usersService.getRecordedPgns(userId)
  }
  
}
