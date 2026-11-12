import { Injectable } from '@nestjs/common';
import { OpeningsService } from 'src/openings/openings.service';
import { MongooseId } from 'src/types/types';
import { UsersService } from 'src/users/users.service';
import { VariationsService } from 'src/variations/variations.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private openingsService: OpeningsService,
    private variationsService: VariationsService,
  ) {}
  async getAdminData() {
    const users = await this.usersService.findUsers();
    const openings = await this.openingsService.findAll();
    const variations = await this.variationsService.findAll();

    return {
      users,
      openings,
      variations,
    };
  }

  async toggleVariationStatus(variationId: MongooseId) {
    return this.variationsService.acceptVariation(variationId);
  }

  async toggleOpeningStatus(openingId: MongooseId) {
    return this.openingsService.acceptOpening(openingId);
  }

  async deleteVariation(variationId: MongooseId) {
    return this.variationsService.deleteOne(variationId);
  }
  async deleteUser(userId: MongooseId) {
    const result = await this.usersService.deleteOne(userId);
    await this.variationsService.deleteOwnedBy(userId);
    await this.openingsService.deletePendingBy(userId);
    return result;
  }
  async deleteOpening(openingId: MongooseId) {
    const opening = await this.openingsService.deleteOne(openingId);
    await this.variationsService.deleteByCode(opening.code);
    return { message: 'Successfully Deleted' };
  }
}
