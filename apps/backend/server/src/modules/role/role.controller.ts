import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from '../../entities/role.entity';
import { RoleDto } from '../../cto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../permission/decorators/require-permissions.decorator';
import { PermissionGuard } from '../permission/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('crm/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePermissions('role:manage')
  @Get('/all')
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @RequirePermissions('role:manage')
  @Get('/get/:id')
  async findOne(@Param('id') id: number): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @RequirePermissions('role:manage')
  @Get('/add')
  async add(@Body() roleDto: RoleDto): Promise<any> {
    return this.roleService.create(roleDto.role_name);
  }

  @RequirePermissions('role:manage')
  @Post('/update')
  async update(@Body() roleDto: RoleDto): Promise<any> {
    return this.roleService.update(
      roleDto.id,
      roleDto.role_name,
      roleDto.role_enabled,
    );
  }
}

