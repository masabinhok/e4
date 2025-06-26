import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from 'src/roles/roles.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { MongooseId } from 'src/types/types';

@UseGuards(AuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Roles(Role.Admin)
  async getAdminData(){
    return this.adminService.getAdminData();
  }

  @Post('variation/toggle-status/:id')
  async toggleVariationStatus(@Param('id') variationId: MongooseId){
    return this.adminService.toggleVariationStatus(variationId);
  }

  @Post('opening/toggle-status/:id')
  async toggleOpeningStatus(@Param('id') openingId: MongooseId){
    return this.adminService.toggleOpeningStatus(openingId);
  }

  @Delete('variation/:id')
  async deleteVariation(@Param('id') variationId: MongooseId){
    return this.adminService.deleteVariation(variationId);
  }

  
}
