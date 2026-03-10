import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('crm/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/all')
  findAll() {
    return this.adminService.findAll();
  }

  @Get('/get/:id')
  findOne(id: number) {
    return this.adminService.findOne(id);
  }
}
