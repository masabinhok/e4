import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

}
