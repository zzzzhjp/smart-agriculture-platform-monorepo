import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AssignRolePermissionsDto,
  CreatePermissionDto,
  SetRoleScopeDto,
  UpsertFeatureAclDto,
} from '../../cto/permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PermissionService } from './permission.service';

@UseGuards(JwtAuthGuard)
@Controller('crm/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/my-routes')
  async getMyRoutes(
    @Req() request: Request & { user: JwtPayload },
  ): Promise<any> {
    return this.permissionService.getMyRoutes(request.user);
  }

  @Get('/all')
  async findAllPermissions() {
    return this.permissionService.findAllPermissions();
  }

  @Post('/create')
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionService.createPermission(dto);
  }

  @Post('/role/assign')
  async assignRolePermissions(@Body() dto: AssignRolePermissionsDto) {
    return this.permissionService.assignRolePermissions(dto);
  }

  @Get('/role/:roleId')
  async getRolePermissions(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionService.getRolePermissions(roleId);
  }

  @Post('/role/scope/upsert')
  async upsertRoleScope(@Body() dto: SetRoleScopeDto) {
    return this.permissionService.upsertRoleScope(dto);
  }

  @Get('/role/scope/:roleId')
  async getRoleScopes(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionService.getRoleScopes(roleId);
  }

  @Post('/feature-acl/upsert')
  async upsertFeatureAcl(@Body() dto: UpsertFeatureAclDto) {
    return this.permissionService.upsertFeatureAcl(dto);
  }

  @Get('/feature-acl/:subjectType/:subjectId')
  async getFeatureAclBySubject(
    @Param('subjectType') subjectType: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.permissionService.getFeatureAclBySubject(subjectType, subjectId);
  }
}
