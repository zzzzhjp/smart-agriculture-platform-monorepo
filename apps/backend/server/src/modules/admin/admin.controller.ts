import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../permission/decorators/require-permissions.decorator';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('crm/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @RequirePermissions('system:role:manage')
  @Get('/all')
  findAll() {
    return this.adminService.findAll();
  }

  @RequirePermissions('system:role:manage')
  @Get('/get/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }
}

