import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard)
@Controller('crm/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/all')
  findAll() {
    return this.adminService.findAll();
  }

  @Get('/get/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }
}
