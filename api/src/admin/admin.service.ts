import { Injectable } from '@nestjs/common';
import { OpeningsService } from 'src/openings/openings.service';
import { UsersService } from 'src/users/users.service';
import { VariationsService } from 'src/variations/variations.service';

@Injectable()
export class AdminService {

  constructor(private usersService: UsersService, private openingsService: OpeningsService, private variationsService: VariationsService){}
  async getAdminData() {
    const users = await this.usersService.findUsers();
    const openings = await this.openingsService.findAll();
    const variations = await this.variationsService.findAll();

    return {
      users, openings, variations
    }
  }
}
