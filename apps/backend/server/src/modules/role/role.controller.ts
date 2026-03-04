import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from '../../entities/role.entity';
import { RoleDto } from '../../cto/role.dto';

@Controller('crm/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/all')
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get('/get/:id')
  async findOne(@Param('id') id: number): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @Get('/add')
  async add(@Body() roleDto: RoleDto): Promise<any> {
    return this.roleService.create(roleDto.role_name);
  }

  @Post('/update')
  async update(@Body() roleDto: RoleDto): Promise<any> {
    return this.roleService.update(
      roleDto.id,
      roleDto.role_name,
      roleDto.role_enabled,
    );
  }
}
